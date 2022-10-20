from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)


from flaskapp import routes
