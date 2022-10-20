""" routes.py - Flask route definitions

Flask requires routes to be defined to know what data to provide for a given
URL. The routes provided are relative to the base hostname of the website, and
must begin with a slash."""
from flaskapp import app
from flask import render_template, jsonify, request
import json
from wrangling_scripts.wrangling import *



# The following two lines define two routes for the Flask app, one for just
# '/', which is the default route for a host, and one for '/index', which is
# a common name for the main page of a site.
#
# Both of these routes provide the exact same data - that is, whatever is
# produced by calling `index()` below.
@app.route('/')
@app.route('/index')
def index():
    """Renders the index.html template"""
    # Renders the template (see the index.html template file for details). The
    # additional defines at the end (table, header, username) are the variables
    # handed to Jinja while it is processing the template.
    return render_template('index.html', get_q=get_query)

@app.route('/getfirequery', methods=['POST'])
def getfirequery():
    w = request.form.get('west')
    s = request.form.get('south')
    e = request.form.get('east')
    n = request.form.get('north')

    return get_query(s,w,n,e)



@app.route('/getfires', methods=['POST'])
def getfires():
    w = request.form.get('west')
    s = request.form.get('south')
    e = request.form.get('east')
    n = request.form.get('north')
    yearStart = request.form.get('yearStart')
    yearEnd = request.form.get('yearEnd')
    prov = request.form.get('prov')
    cause = request.form.get('cause')
    cluster = request.form.get('cluster')

    return get_wildfires(s,w,n,e, yearStart, yearEnd, prov, cause, cluster)



