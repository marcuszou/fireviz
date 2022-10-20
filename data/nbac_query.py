#!/usr/bin/env python3
# -*- coding: utf-8 -*-


import sqlite3
import pandas as pd



conn = sqlite3.connect('./nbac.sqlite')
data = pd.read_sql_query ('SELECT * FROM nbac', conn)
conn.close()


# Pandas Profiling library
#pip install pandas-profiling[notebook]
from pandas_profiling import ProfileReport
profile1 = ProfileReport(data, title="Report")
profile1.to_file('Pandas_Profiling.html')


# DataPrep library
#pip install dataprep
from dataprep.eda import create_report
profile2 = create_report(data)
profile2.save('DataPrep_Report.html')

# # AutoViz library
# #pip install autoviz
# from autoviz.AutoViz_Class import AutoViz_Class
# AV = AutoViz_Class()
# df_av = AV.AutoViz(‘parking.csv’)

# # SweetViz library