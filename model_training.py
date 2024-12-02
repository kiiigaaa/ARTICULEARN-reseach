# Import necessary libraries
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report
import numpy as np

# Step 1: Load Features and Labels
features = np.load("processed_data/features.npy")  # Path to features.npy
labels = np.load("processed_data/labels.npy")  # Path to labels.npy

# Step 2: Encode Labels
label_encoder = LabelEncoder()
encoded_labels = label_encoder.fit_transform(labels)

# Step 3: Split Data into Training and Testing Sets
X_train, X_test, y_train, y_test = train_test_split(
    features, encoded_labels, test_size=0.2, random_state=42
)

# Step 4: Convert Data to PyTorch Tensors
X_train_tensor = torch.tensor(X_train, dtype=torch.float32)
X_test_tensor = torch.tensor(X_test, dtype=torch.float32)
y_train_tensor = torch.tensor(y_train, dtype=torch.long)
y_test_tensor = torch.tensor(y_test, dtype=torch.long)

# Step 5: Define the Neural Network Architecture
class PhonologicalErrorClassifier(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super(PhonologicalErrorClassifier, self).__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_size, hidden_size)
        self.fc3 = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.relu(self.fc2(x))
        x = self.fc3(x)
        return x

# Initialize the model
input_size = X_train.shape[1]  # Number of MFCC features
hidden_size = 64
output_size = len(label_encoder.classes_)  # Number of unique labels
model = PhonologicalErrorClassifier(input_size, hidden_size, output_size)

# Step 6: Define Loss Function and Optimizer
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Step 7: Train the Model
num_epochs = 50
for epoch in range(num_epochs):
    # Forward pass
    outputs = model(X_train_tensor)
    loss = criterion(outputs, y_train_tensor)

    # Backward pass
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    if (epoch+1) % 10 == 0:
        print(f"Epoch [{epoch+1}/{num_epochs}], Loss: {loss.item():.4f}")

# Step 8: Evaluate the Model
with torch.no_grad():
    y_pred = model(X_test_tensor)
    y_pred_classes = torch.argmax(y_pred, axis=1)

# Classification Report
print("Classification Report:")
print(classification_report(y_test, y_pred_classes, target_names=label_encoder.classes_))

# Save the Model
torch.save(model.state_dict(), "phonological_error_classifier.pth")
print("Model saved as 'phonological_error_classifier.pth'.")