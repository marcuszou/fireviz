"""
wrangling.py - utilities to supply data to the templates.
This file contains a pair of functions for retrieving and manipulating data
that will be supplied to the template for generating the table. 
"""


# Function to get data from SQL database
import sqlite3
import geojson

# following sourced from
# https://gis.stackexchange.com/questions/142970/dump-a-geojson-featurecollection-from-spatialite-query-with-python

def dict_factory(cursor, row):
    d = {}
    for idx,col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


def get_query(south, west, north, east):
    return_d = {}

    q = f"""
    select asgeojson(GEOMETRY) as geom from nbac where ST_Intersects(polygonfromtext('POLYGON(({west} {south},{west} {north},{east} {north},{east} {south},{west} {south}))'), GEOMETRY) limit 500"""
    return_d['query'] = q
    
    return return_d


def get_wildfires(south, west, north, east, yearStart, yearEnd, prov, cause, cluster):
    fires = None
    with sqlite3.connect('data/nbac.sqlite') as conn:
    # with sqlite3.connect('../nbac.sqlite') as conn: # Moved the nbac.sqlite database a folder up so you don't need to move it when pushing/pulling from Git
        conn.enable_load_extension(True)
        conn.execute('SELECT load_extension("mod_spatialite");')
        conn.row_factory = dict_factory
        q = f"""
with cte_geom as (
select polygonfromtext(
                        'POLYGON((
            {east} {south},
            {east} {north},
            {west} {north},
            {west} {south},
            {east} {south}
            ))'
        , 4326) as geom)
select
    year
    , nfireid
    , basrc
    , firemaps
    , firemapm
    , firecaus
    , burnclas
    , sdate
    , edate
    , afsdate
    , afedate
    , capdate
    , poly_ha
    , adj_ha
    , adj_flag
    , agency
    , bt_gid
    , version
    , comments
    , basrc_1
    , new_flg
    , asgeojson(SnapToGrid(n.geom, 0.0001)) as geom
    , Cluster
from nbac n, cte_geom c
where ST_intersects(n.geom, c.geom) 
{yearStart}
{yearEnd}
{prov}
{cause}
{cluster}
and n.rowid in (select rowid from SpatialIndex
where f_table_name = 'nbac' and
search_frame = polygonfromtext(
                        'POLYGON((
            {east} {south},
            {east} {north},
            {west} {north},
            {west} {south},
            {east} {south}
            ))'
        , 4326)) 
limit 500
                """
        fires = conn.execute(q).fetchall()

        features = list()

        for row in fires:
            if not isinstance(row['geom'], str):
                # print(row)
                continue
            geom = geojson.loads(row['geom'])
            row.pop('geom')
            feature = geojson.Feature(geometry=geom, properties=row)
            features.append(feature)

        fireCollection = geojson.FeatureCollection(features)

        #fireCollection['crs'] = { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } }

        return fireCollection

