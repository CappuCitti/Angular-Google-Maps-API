# main.py

from flask import Flask, request
from flask import jsonify
from flask_cors import CORS

import geojson
import shapely.wkt

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
            "CI_VETTORE":s['CI_VETTORE'],
            "WKT":s['WKT']
        })
        
    return jsonify(output)

@app.route('/sphere', methods=['GET'])
def center_sphere():
    r = (float(request.args.get('radius')) * 0.00001)/1.1132
    lat = float(request.args.get('lat'))
    lng = float(request.args.get('lng'))

    output = []
    for s in table.find({
        '$and':
            [
                {'WGS84_X': {'$gt': lng - r}},
                {'WGS84_X': {'$lt': lng + r}},
                {'WGS84_Y': {'$gt': lat - r}},
                {'WGS84_Y': {'$lt': lat + r}}
            ]
        }):
        output.append({
            "INDIRIZZO":s['INDIRIZZO'],
            "WGS84_X":s["WGS84_X"],
            "WGS84_Y":s["WGS84_Y"],
            "CLASSE_ENE":s["CLASSE_ENE"],
            "EP_H_ND":s["EP_H_ND"],
            "FOGLIO":s["FOGLIO"],
            "CI_VETTORE":s['CI_VETTORE'],
            "WKT":s['WKT']
        })
        
    return jsonify(output)

@app.route('/geogeom', methods=['GET'])
def get_all_stars():
    output = []

    group = {
        '$group': {
            '_id': {
                'SEZ': '$SEZ',
                'WKT': '$WKT'
            },
            'AVG': {
                '$avg': '$EP_H_ND'
            },
            'SUM': {
                '$sum': '$EP_H_ND'
            }
        }
    }

    limit = {
        '$limit': 30
    }

    if request.args.get('page') != None:
        foglio = int(request.args.get('page'))
        for s in table.aggregate([{'$match': {"FOGLIO": foglio}}, group]):
            output.append({'somma': s['SUM'], 'media': s['AVG'], 'WKT': s['_id']['WKT'], 'SEZ': s['_id']['SEZ'], 'color': get_color(s['AVG'])})
        return jsonify(output)
    elif request.args.get('radius') != None:
        r = (float(request.args.get('radius')) * 0.00001)/1.1132
        lat = float(request.args.get('lat'))
        lng = float(request.args.get('lng'))

        match = {
            '$match': {
                '$and':
                [
                    {'EP_H_ND': {'$gt': 0}},
                    {'WGS84_X': {'$gt': lng - r}},
                    {'WGS84_X': {'$lt': lng + r}},
                    {'WGS84_Y': {'$gt': lat - r}},
                    {'WGS84_Y': {'$lt': lat + r}}
                ]
            }
        }
        
        for s in table.aggregate([match, group, limit]):
            # Converte da WKT in GeoJson Geometry
            g1 = shapely.wkt.loads(s['_id']['WKT'])
            g2 = geojson.Feature(geometry=g1,
                                properties={'media': s['AVG'], 'somma': s['SUM'], 'sezione': s['_id']['SEZ'], 'color': get_color(s['AVG'])})
            output.append(g2)
        return jsonify(geojson.FeatureCollection(output))
    else:
        match = {
            '$match': {
                'EP_H_ND': {'$gt': 0}
            }
        }
        for s in table.aggregate([match, group]):
            output.append({'somma': s['SUM'], 'media': s['AVG'], 'WKT': s['_id']['WKT'], 'SEZ': s['_id']['SEZ'], 'color': get_color(s['AVG'])})
        return jsonify(output)
    
def get_color(eph): 
    color = "#003000"

    if eph > 1948 and eph <= 3780:
        color = "#2F4E4F"
    elif eph > 1068 and eph <= 1948:
        color = "#3B625B"
    elif eph > 1032 and eph <= 1068:
        color = "#487563"
    elif eph > 116 and eph <= 1032:
        color = "#558869"
    elif eph > 100 and eph <= 116:
        color = "#629A6C"
    elif eph > 84 and eph <= 100:
        color = "#77A876"
    elif eph > 70 and eph <= 84:
        color = "#93B68B"
    elif eph > 58 and eph <= 70:
        color = "#ADC49F"
    elif eph > 40 and eph <= 58:
        color = "#C5D2B4"
    elif eph > 36 and eph <= 40:
        color = "#DADFC9"
    elif eph <= 36:
        color = "#EBECDF"

    return color

# Checks to see if the name of the package is the run as the main package.
if __name__ == "__main__":
    # Runs the Flask application only if the main.py file is being run.
    app.run(debug=True)