#!/usr/bin/env python3
# -*- coding: utf-8 -*-


import sqlite3
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np


conn = sqlite3.connect('data\nbac.sqlite')
# Get a cursor
cursor = conn.cursor()
data = pd.read_sql_query ('SELECT * FROM nbac', conn)


# data['adj_ha'].plot.hist(grid=True, bins=20, rwidth=0.9,color='#607c8e')
# plt.hist(np.log(data['adj_ha']), 30, range=[-10, 10], facecolor='gray', align='mid')
# plt.hist(data['adj_ha'], 30, range=[0, 1000], facecolor='gray', align='mid')

new_data = data[['firecaus', 'adj_ha']].copy()
new_data['adj_ha'] = np.log(new_data['adj_ha'])
new_data.loc[new_data['adj_ha']<0,'adj_ha'] = 0
new_data = new_data.dropna()
new_data_filter = abs(new_data)


import gower
distance_matrix = gower.gower_matrix(new_data_filter)


#import scipy.cluster.hierarchy as sch
#dendrogram = sch.dendrogram(sch.linkage(new_data_filter, method = 'average'))


from sklearn.cluster import AgglomerativeClustering
hc = AgglomerativeClustering(n_clusters=3, affinity='precomputed', linkage = 'average')
y_hc = hc.fit_predict(distance_matrix)

new_data = data[['year', 'firecaus', 'adj_ha', 'centroid_x', 'centroid_y']]
new_data['Cluster'] = y_hc + 1


choice_year = 2020
new_data_filter = new_data.loc[new_data['year']==choice_year].reset_index()
#new_data_filter = new_data

import seaborn as sns
import matplotlib.pyplot as plt
fig, ax = plt.subplots(figsize=(15, 8))
p = sns.scatterplot(data=new_data_filter, x='centroid_x', y='centroid_y', hue='Cluster', style='firecaus', size='adj_ha', sizes=(20, 1000), palette='Accent', ax=ax)
sns.move_legend(p, bbox_to_anchor=(1, 1.02), loc='upper left')
plt.savefig("Cluster_5.png", dpi=200)

data['Cluster'] =  y_hc + 1

data.to_sql(name='nbac_nov13', if_exists='replace', index=False, con=conn)
conn.commit()
conn.close()

# Check
conn = sqlite3.connect('nbac_nov13.sqlite')
data_check = pd.read_sql_query ('SELECT * FROM nbac_nov13', conn)
conn.close()