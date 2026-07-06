from flask import Flask, render_template, Response
from data.lunar_data import get_lunar_data
import json

app = Flask(__name__)
app.json.ensure_ascii = False


@app.route('/')
def home():

    data = get_lunar_data()

    return render_template(
        'index.html',
        data=data,
    )


@app.route('/lunar')
def lunar():

    response = Response(
        json.dumps(
            get_lunar_data(),
            ensure_ascii=False
        ),
        mimetype='application/json'
    )

    response.headers[
        'Content-Type'
    ] = 'application/json; charset=utf-8'

    return response


@app.route('/sensor')
def sensor():

    data = get_lunar_data()

    payload = {
        'state': f"{data['day']:02d}/{data['month']:02d}",
        'attributes': {
            'solar_date': data['solar_date'],
            'weekday': data['weekday'],
            'can_chi_year': data['can_chi_year'],
            'can_chi_month': data['can_chi_month'],
            'can_chi_day': data['can_chi_day'],
            'solar_term': data['solar_term'],
            'holiday': data['holiday'],
            'leap_month': data['leap_month']
        }
    }

    response = Response(
        json.dumps(
            payload,
            ensure_ascii=False
        ),
        mimetype='application/json'
    )

    response.headers[
        'Content-Type'
    ] = 'application/json; charset=utf-8'

    return response


if __name__ == '__main__':

    app.run(
        host='0.0.0.0',
        port=5050
    )