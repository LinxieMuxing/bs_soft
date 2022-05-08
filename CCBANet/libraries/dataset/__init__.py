from sklearn.model_selection import train_test_split              # Used for split train & val dataset
from torch.utils.data import DataLoader
from .kvasirseg import LoadKvasirSegDataset, KvasirSegDataset


#该初始化只是定义了两个函数 用于了主函数的train.py
#Load dataset information
def LoadDataset(config): #from .kvasirseg import LoadKvasirSegDataset
  if config["dataset"]["name"]=="Kvasir-SEG":
    data = LoadKvasirSegDataset(config) #d['image'] = cju0qkwl35piu0993l0dewei2.jpg;d['height'] = 529; ...
    #Split data 分割数据
    '''
    "dataset":{
      "name":"Kvasir-SEG",                                      # "Kvasir-SEG", "CVC-ClinicDB", "CVC-EndoSceneStill"数据集类型
      "random_state":2021,
      "split_ratio_train_testval":0.2,
      "split_ratio_test_val":0.5,
    },   
    '''
    random_state = config["dataset"]["random_state"]#测试集的参数
    split_ratio_train_testval = config["dataset"]["split_ratio_train_testval"]
    split_ratio_test_val = config["dataset"]["split_ratio_test_val"]
    train_data, val_test_data = train_test_split(data, test_size=split_ratio_train_testval, random_state=random_state)#这个函数不懂 将现有图片分成三个集合
    val_data, test_data = train_test_split(val_test_data, test_size=split_ratio_test_val, random_state=random_state)
    return train_data, val_data, test_data
  else:
    raise Exception("Dataset name is unvalid.")#抛出异常


def BuildDatasetAndDataloader(config, train_data, val_data, test_data, debug=False):#from .kvasirseg import KvasirSegDataset
  if config["dataset"]["name"]=="Kvasir-SEG":#使用了kvasireg.py中 class KvasirSegDataset 以及 torch的DateLoader
    train_dataset = KvasirSegDataset(config=config,data=train_data,mode="train",normalization=not debug,augmentation=config["train"]["image_data_augmentation"])#"image_data_augmentation":True
    train_dataloader = DataLoader(dataset=train_dataset, batch_size=config["train"]["batch_size"], shuffle=True, num_workers=2, pin_memory=True)#"batch_size":8 使用torch的DateLoader函数载入数据

    val_dataset = KvasirSegDataset(config=config,data=val_data,mode="val",normalization=not debug,augmentation=False)
    val_dataloader = DataLoader(dataset=val_dataset, batch_size=config["val"]["batch_size"], shuffle=False, num_workers=2, pin_memory=True)

    test_dataset = KvasirSegDataset(config=config,data=test_data,mode="test",normalization=not debug,augmentation=False)
    test_dataloader = DataLoader(dataset=test_dataset, batch_size=config["test"]["batch_size"], shuffle=False, num_workers=2, pin_memory=True)
    return train_dataset,train_dataloader,val_dataset,val_dataloader,test_dataset,test_dataloader
  else:
    raise Exception("Dataset name is unvalid.")#抛出异常