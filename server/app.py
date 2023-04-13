# main.py

from flask import Flask
from flask import jsonify
from flask_cors import CORS

# Mongo libs
from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017')
db = client.MilWKT4326
table = db.access_to_electricity

app = Flask(__name__)
CORS(app)

# Annotation that allows the function to be hit at the specific URL.
@app.route("/")
def index():
    return "Hello world!"

# Questa route effettua una find() su tutto il DB (si limita ai primi 100 risultati)
@app.route('/addresses', methods=['GET'])
def get_all_addresses():
    output = []
    for s in table.find().limit(100):
        output.append(s['INDIRIZZO'])
    return jsonify({'result': output})

@app.route('/ci_vettore', methods=['GET'])
def get_vettore():
    output = []
    for s in table.find().limit(100):
        output.append(s['CI_VETTORE'])
    return jsonify({'result': output})

@app.route('/ci_vettore/<int:foglio>', methods=['GET'])
def get_vettore_page(foglio):
    output = []
    for s in table.find({"FOGLIO": foglio}):
        output.append({
            "INDIRIZZO":s['INDIRIZZO'],
            "WGS84_X":s["WGS84_X"],
            "WGS84_Y":s["WGS84_Y"],
            "CLASSE_ENE":s["CLASSE_ENE"],
            "EP_H_ND":s["EP_H_ND"],
            "FOGLIO":s["FOGLIO"],
            "CI_VETTORE":s['CI_VETTORE']
        })
        
    return jsonify(output)

# Checks to see if the name of the package is the run as the main package.
if __name__ == "__main__":
    # Runs the Flask application only if the main.py file is being run.
    app.run(debug=True)