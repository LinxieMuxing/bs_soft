import sys
sys.path.append("./libraries/CCBANet")
import os
import argparse
import numpy as np
import torch
import copy
import json
import time
from config import CONFIG

from libraries.CCBANet.models.CCBANet import CCBANetModel

import albumentations as A
import torchvision.transforms as transforms
import tifffile
from PIL import Image
import cv2
from torch.utils.data import DataLoader
from torch.utils.data import Dataset


'''

大致流程：
1.修改配置
2.读取文件JSON
3.根据JSON找到相应图片
4.对图片进行裁剪
5.将图片输入网络
6.输出segm和visvisualize

'''


def parse_arguments():  # 输出opt
    parse = argparse.ArgumentParser(description='CCBANet Polyp Segmentation')

    parse.add_argument('--data', type=str)

    return parse.parse_args()

def epoch_testing(model, test_dataloader, device):#批次测试
    # Switch model to evaluation mode
    total_time = 0
    total = len(test_dataloader)#测试数据集
    print(total)
    model.eval()#不改变模型的梯度等参数

    out_pred = torch.FloatTensor().to(device)  # Tensor stores prediction values
    out_index = torch.IntTensor()
    print(test_dataloader)
    with torch.no_grad():  # Turn off gradient
        # For each batch
        for step, (images, indexs) in enumerate(test_dataloader):#test_dataloader 那个class对象
            out_index = torch.cat((out_index, indexs), 0)
            # Move images, labels to device (GPU)
            images = images.to(device)
            indexs = indexs.to(device)

            # Feed forward the model
            test_time_begin = time.time()
            predicts = model(images)
            test_time_end = time.time()
            total_time += (test_time_end - test_time_begin)

            out_pred = torch.cat((out_pred, predicts[0]), 0)
            print('Testing iter:{:d}/{:d}'.format(step + 1, total))

    if torch.cuda.is_available(): torch.cuda.empty_cache()
    return out_pred, out_index, total_time


def BuildDatasetAndDataloader(config, test_data, debug=False):
    test_dataset = KvasirSegDataset(config=config, data=test_data,  normalization=not debug, augmentation=False) #对图像进行一个裁剪
    test_dataloader = DataLoader(dataset=test_dataset, batch_size=1, shuffle=False, num_workers=2, pin_memory=True)
    return test_dataset, test_dataloader

def GetImage_Mask_Transform_SpatialLevel():#空间层次
  image_mask_transform_spatiallevel=A.Compose([
    A.HorizontalFlip(p=0.5),
    A.VerticalFlip(p=0.5),
    #A.Transpose(p=0.5),
    A.ShiftScaleRotate(shift_limit=0.2, scale_limit=0.5, rotate_limit=90,border_mode=0, value=0,p=0.5),
  ],additional_targets={ "image1": "image", "mask1": "mask"},p=1)
  return image_mask_transform_spatiallevel

def GetImage_Mask_Transform_RandomCrop(image_size):#随机剪裁
  image_mask_transform_randomCrop=A.Compose([
    A.RandomCrop(height=image_size[0],width=image_size[1],p=1),
    ],additional_targets={ "image1": "image", "mask1": "mask"},p=1)
  return image_mask_transform_randomCrop

def GetImage_Transform_PixelLevel():#像素级
  image_transform_pixellevel = A.Compose([
      #A.RandomBrightnessContrast(p=0.5)
  ],p=1)
  return image_transform_pixellevel


#test_dataset = KvasirSegDataset(config=config, data=test_data, mode="test", normalization=not debug, augmentation=False) #对图像进行一个裁剪
class KvasirSegDataset(Dataset):#对图片进行class定义
    def __init__(self, config, data,  normalization=True, augmentation=False):
        self.config = config
        self.data = data
        self.normalization = normalization
        self.augmentation = augmentation

        #self.mode = mode
        self.image_size = config["test"]["image_size"]#图片的剪裁规格

        self.imagenet_mean = config["imagenet_mean"]#图片正则化参数
        self.imagenet_std = config["imagenet_std"]

        self.image_paths = []#图片路径

        self.image_mask_transform_spatiallevel = GetImage_Mask_Transform_SpatialLevel()#其中有mask参数 能执行不管
        self.image_mask_transform_randomCrop = GetImage_Mask_Transform_RandomCrop(self.image_size)
        self.image_transform_pixellevel = GetImage_Transform_PixelLevel()

        # Define list of image transformations
        label_transformation = [transforms.ToTensor()]
        image_transformation = [transforms.ToTensor()]
        if self.normalization:
            image_transformation.append(transforms.Normalize(self.imagenet_mean, self.imagenet_std))
        self.label_transformation = transforms.Compose(label_transformation)
        self.image_transformation = transforms.Compose(image_transformation)

        # Get all image paths from data
        for index in np.arange(len(self.data)):
            d = self.data[index]
            self.image_paths.append("/home/bs_soft/admin-server/public/upload/" + d["image"])#图片存储目录

    def __len__(self):
        return len(self.image_paths)

    def GetLength(self):
        return self.__len__()

    def GetDataItemByIndex(self, index):
        return self.data[index]

    def GetImagePathByIndex(self, index):
        return self.image_paths[index]

    def __getitem__(self, index):
        # Read image
        image_path = self.image_paths[index]
        image_data = Image.open(image_path).convert("RGB")

        image_data = np.array(image_data)
        image_data = \
        A.Resize(height=self.image_size[0], width=self.image_size[1], interpolation=cv2.INTER_LINEAR, p=1)(image=image_data)["image"]

        image_data = Image.fromarray(image_data)

        image_data = self.image_transformation(image_data)
        return image_data,  index


def VisualizeImageWithMask(dir_mask, dir_visualize, test_dataset):
    print("Run mask-visualizing ....")
    color_mask = (0, 255, 0)
    alpha = 0.3
    num_imgs = test_dataset.GetLength()#获取图片数量
    image_paths = []
    mask_paths = []
    image_names = []
    for i in np.arange(num_imgs):
        image_paths.append(test_dataset.GetImagePathByIndex(i))

        mask_paths.append(dir_mask + "/" + test_dataset.GetDataItemByIndex(i)["image"])

        image_names.append(test_dataset.GetDataItemByIndex(i)["image"])

    for index in np.arange(num_imgs):

        image_org = cv2.imread(image_paths[index])

        mask_org = cv2.imread(mask_paths[index])
        overlay = image_org.copy()
        output = image_org.copy()
        overlay[mask_org[:, :, 0] >= 128] = color_mask
        output = cv2.addWeighted(overlay, alpha, output, 1 - alpha, 0)
        print("Generate {}/{}:{}....".format(index + 1, num_imgs, os.path.splitext(image_names[index])[0] + ".jpg"))

        dir_path = '/'.join((dir_visualize + '/' + image_names[index]).split('/')[0:-1])
        if os.path.exists(dir_path) == False:
            os.makedirs(dir_path)

        cv2.imwrite(dir_visualize + '/' + image_names[index], output)


if __name__ == '__main__':
    opt = parse_arguments()  # 测试参数
    #测试集 python ./zxg_test.py --data "数据图片的路径" 
    #获得图片尺寸
    file_path = opt.data
    img = Image.open(file_path)
    w = img.width       #图片的宽
    h = img.height  
    
    test_data = []  #读取单个文件
    d = {}
    d["height"] = h
    d["width"] = w
    d["image"] = opt.data.split("/")[-1]
    test_data.append(d)

    print((test_data))
    # Create dataset and dataloader
    test_dataset, test_dataloader = BuildDatasetAndDataloader(CONFIG, test_data)
    print(test_data)

    # Create model and get number of trainable parameters
    model = CCBANetModel(CONFIG).to(CONFIG["device"])
    #print(model)
    # Number of trainable parameters
    print("Num of patameters:", sum(p.numel() for p in model.parameters() if p.requires_grad))  # 特征数

    #输出文件夹的配置
    dir_mask = '/home/bs_soft/admin-server/public/output/segm' 
    dir_visualize = '/home/bs_soft/admin-server/public/output/visualize'
    #device = 'cuda'
    device = 'cpu'#使用cpu环境
    path_model = '/home/bs_soft/CCBANet-main/output/model/model_epoch_zxg.pth'

    model.load_state_dict(torch.load(path_model, map_location=torch.device(device))["model"])
    model.eval()

    # Metrics
    #criteria_metrics = evaluate_single  # evaluate

    print("Run testing....")
    out_pred, out_index, total_time = epoch_testing(model, test_dataloader, device)
    num_imgs = out_index.size()[0]
    fps = num_imgs / total_time
    meantime = total_time / num_imgs
    print('Number of images:{:4d} | Total time:{:4.4f} | Mean time:{:4.4f} | Frame per second:{:2.4f}'.format(num_imgs,
                                                                                                              total_time,
                                                                                                              meantime,
                                                                                                              fps))

    if CONFIG["test"]["mask_generating"] == True:
        print("Run mask-generating ....")
        # Generate mask
        trans_pil = transforms.ToPILImage()
        for index in np.arange(num_imgs):
            img = out_pred[index].cpu()#out_pred 输出的黑白图片
            img = (img > 0.5) * 1.0#对图片进行二值化
            img = torch.cat([img, img, img], 0)
            metadata = test_dataset.GetDataItemByIndex(out_index[index])
            image_name = metadata["image"]
            w = int(metadata["width"])
            h = int(metadata["height"])
            trans_size = transforms.Resize((h, w), Image.NEAREST)
            img = trans_size(trans_pil(img))

            dir_path = '/'.join((dir_mask + "/" + image_name).split('/')[0:-1])
            if os.path.exists(dir_path) == False:
                os.makedirs(dir_path)

            img.save(dir_mask + "/" + image_name)
            print(
                "Generate {}/{}:{} (w:{} x h:{})".format(index + 1, num_imgs, os.path.splitext(image_name)[0] + ".jpg", w, h))


        VisualizeImageWithMask(dir_mask, dir_visualize, test_dataset)

    print('Done')

