#!/usr/bin/env python3
# -*- coding: utf-8 -*-


import sqlite3
import pandas as pd



conn = sqlite3.connect('nbac_nov13.sqlite')
# Get a cursor
cursor = conn.cursor()
data = pd.read_sql_query ('SELECT * FROM nbac_nov13', conn)




new_data = data[['firecaus', 'adj_ha', 'centroid_x', 'centroid_y']]
new_data = new_data.dropna()
new_data_filter = new_data

cols=['firecaus']



# Hot encoding or Dummy Variable Creation
new_data_filter_dummy = pd.get_dummies(new_data_filter, columns=cols, drop_first=True)
temp = new_data_filter_dummy.to_numpy()
data_normalize = new_data_filter_dummy.copy()


# Import the StandardScaler class
from sklearn.preprocessing import StandardScaler
# Create an object of the class StandardScaler
scaler = StandardScaler()

# Fit and Transform the data for normalization
data_normalize = scaler.fit_transform(data_normalize)
data_normalize[:,3:7] = temp[:,3:7]


from sklearn.cluster import KMeans
from sklearn_extra.cluster import KMedoids   # pip install scikit-learn-extra
import matplotlib.pyplot as plt
wcss = []
for i in range(1, 20):
    kmeans = KMeans(n_clusters = i, init = 'k-means++', random_state = 42)
    kmeans.fit(data_normalize)
    wcss.append(kmeans.inertia_)
plt.plot(range(1, 20), wcss)
plt.title('The Elbow Method')
plt.xlabel('Number of clusters')
plt.ylabel('WCSS')
#plt.show()
plt.savefig('Elbow.png', dpi=400)

kmeans = KMeans(n_clusters = 5, init = 'k-means++', random_state = 42)
Clusters = kmeans.fit_predict(data_normalize)
new_data_filter['Cluster'] = Clusters
data['Cluster'] = Clusters
Clusters = pd.Series(Clusters).astype(str)


data.to_sql(name='nbac_nov13', if_exists='replace', index=False, con=conn)
conn.commit()
conn.close()

# Check
conn = sqlite3.connect('nbac_nov13.sqlite')
data_check = pd.read_sql_query ('SELECT * FROM nbac_nov13', conn)
conn.close()