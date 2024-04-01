import numpy as np
from flask import Flask, request, jsonify, render_template
import pickle
import pandas as pd
from io import StringIO
from preprocessing import extract_features

app = Flask(__name__, '/static')
# Load the model
model = pickle.load(open("model.sav", 'rb'))
N = 60
f_s = 30
T = 1/f_s
denominator = 10
@app.route('/api',methods=['POST'])
def predict():
    if 'file' not in request.files:
        return 'No file uploaded'
    file = request.files['file']
    
    if file.filename == '':
        return 'Empty file uploaded'
    try:
        file_str = file.read().decode('utf-8')
        file_obj = StringIO(file_str)
        df = pd.read_csv(file_obj,usecols=["ax1","ay1","az1","ax2","ay2","az2","ax3","ay3","az3","ax4","ay4","az4"])
        N = 60
        num_slices = df.shape[0]//N
        temp = df.values[:num_slices*N,:]
        input_data = temp.reshape((num_slices,N,12))
        X_new = extract_features(input_data,T,N,f_s,denominator)
        predictions = model.predict(X_new)
        return jsonify({'predictions': predictions.tolist()}), 200
    except Exception as e:
        return f'Error: {str(e)}'


@app.route('/',methods=['GET'])
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run()