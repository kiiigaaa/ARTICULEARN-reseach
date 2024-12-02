# -*- coding: utf-8 -*-
"""extract_features.ipynb

Automatically generated by Colab.

Original file is located at
    https://colab.research.google.com/drive/1LuicrJUDtacwVI05ewlgYKg8dbv7j2Vd
"""

# Install necessary library for Excel processing
!pip install openpyxl --quiet

# Import required libraries
import pandas as pd
import os
import zipfile
from google.colab import files

"""**Step 1:** Upload the dataset (Excel file)"""

print("Upload your dataset (Excel file).")
uploaded_csv = files.upload()

"""**Step 2:** Upload the audio files (zipped folder)*italicized text*"""

print("Upload your audio files (zipped folder).")
uploaded_audio = files.upload()

"""**Extract the audio files**"""

audio_zip_filename = list(uploaded_audio.keys())[0]  # Get the uploaded zip file name
with zipfile.ZipFile(audio_zip_filename, 'r') as zip_ref:
    zip_ref.extractall("audio_files")  # Extract all files to 'audio_files' folder
print("Audio files extracted successfully!")

"""**Step 3:** Load the dataset"""

dataset_filename = list(uploaded_csv.keys())[0]
dataset = pd.read_excel(dataset_filename, engine='openpyxl')  # Load the dataset

# Display the dataset
print("Dataset loaded successfully!")
print(dataset.head())

"""**Step 4:** Verify if all audio files are available"""

audio_files_path = "audio_files"
audio_files = os.listdir(audio_files_path)
missing_files = [file for file in dataset["File Name"] if file not in audio_files]

if missing_files:
    print("Missing audio files:", missing_files)
else:
    print("All audio files are available!")

"""**Step 5:** Prepare the data"""

# Add the full path of the audio files to the dataset
dataset["Audio Path"] = dataset["File Name"].apply(lambda x: os.path.join(audio_files_path, x))
print("Audio paths added to the dataset.")
print(dataset.head())

# Import required libraries
import librosa
import numpy as np

# Define a function to extract MFCC features
def extract_mfcc(file_path, n_mfcc=13, sr=16000):
    try:
        # Load the audio file with a target sampling rate
        audio, _ = librosa.load(file_path, sr=sr)
        # Compute MFCCs
        mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=n_mfcc)
        # Return mean MFCCs for a fixed-length representation
        return np.mean(mfccs.T, axis=0)
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

# Initialize lists to store features and labels
features = []
labels = []

# Iterate through the dataset to extract features
for index, row in dataset.iterrows():
    audio_path = row["Audio Path"]  # Get the audio file path
    label = row["Error Description"]  # Get the label for the audio

    # Extract features for the audio file
    mfcc = extract_mfcc(audio_path)
    if mfcc is not None:  # Only add if MFCC extraction was successful
        features.append(mfcc)
        labels.append(label)

# Convert features and labels to numpy arrays
features_array = np.array(features)
labels_array = np.array(labels)

# Save the features and labels for model training
np.save("features.npy", features_array)
np.save("labels.npy", labels_array)

# Provide download links for the saved files
from google.colab import files
files.download("features.npy")
files.download("labels.npy")

print("Feature extraction completed successfully!")

print(labels_array)

import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report

# Load the features and labels
features = np.load("features.npy")
labels = np.load("labels.npy")

output_dir = "processed_data"
os.makedirs(output_dir, exist_ok=True)
# Save extracted features and labels in a directory

np.save(os.path.join(output_dir, "features.npy"), features_array)
np.save(os.path.join(output_dir, "labels.npy"), labels_array)