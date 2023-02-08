Wildfire Data Visualization
=======================



## Project Summary

We have produced a Python Flask webapp providing novel visualizations to wildfires in Canada between 1986 and 2020 inclusive from the Canadian Wildland Fire Information System (CWFIS). We visualize the data from the National Burned Area Composite (NBAC) after converting it from shapefile to spatialite database and include other statistics that dynamically update based on where the user pans the map. 

We thought that while the CWFIS map was interesting, we wanted to be able to show data and wildfire patterns without requiring GIS knowledge, so this is what we made!

## Live Demo
https://fireviz.corunsol.net/


## Table of Contents

- [Database Setup](#Database-Setup)
- [Webapp Setup with Anaconda3 in Windows](#Webapp-Setup-with-Anaconda3-in-Windows)
- [Webapp Setup with Python3 in Windows](#Webapp-Setup-with-Python3-in-Windows)
- [Webapp Setup with Python3 in Ubuntu/Debian](#Webapp-Setup-with-Python3-in-Ubuntu/Debian)
- [Repo Structure](#Repo-Structure)

### Database Setup

1. Download the compressed sqlite database the webapp requires from here https://drive.google.com/file/d/1LwcFjDItzZRMXoS0d3NZFWfqHkscoPD7/view?usp=sharing and unzip it.

2. Move the decompressed `nbac.sqlite` to the project's `cse-6242/data` directory, overwrite it when prompted.

### Webapp Setup with Anaconda3 in Windows

1. Install the Anaconda environment from `environment.yml` in the project's root with Anaconda Prompt and activate `wildfires` env:

   ```
   conda env create -f setup\environment.yml
   conda activate wildfires
   ```

3. unzip the "`sqlite-dll-win64-x64-3370000.zip`" in `setup` folder into `<Anaconda3 installation directory>\DLLs` folder.

4. unzip the "`mod_spatialite-5.0.1-win-amd64.7z`" in `setup` folder into `<Anaconda3 installation directory>\DLLs` folder.

5. Create a `System Environment Variable`, pointing to `<Anaconda3 installation directory>\DLLs`.

6. Navigate to the project's root directory and run `python run.py` (ensue the Python Interpreter is the one in Step 2).

4. Open `http://127.0.0.1:5000/` or `http://localhost:5000/` in your favorite browser (Chrome for best results).

### Webapp Setup with Python3 in Windows

1. Install the Python virtual environment and libraries by running the command below:

   ```shell
   pip3 install virtualenv
   ```

2. Create and activate the virtual environment. 

   ```shell
   py -m venv wildfires
   .\wildfires\Scripts\activate
   ```

3. Install the libraries by running the command below:

   ```
   pip3 install -r setup\requirements.txt
   ```

4. unzip the "`sqlite-dll-win64-x64-3370000.zip`" in `setup` folder into `<Python3 installation directory>\DLLs` folder.

5. unzip the "`mod_spatialite -5.0.1-win-amd64.7z`" in `setup` folder into `<Python3 installation directory>\DLLs` folder.

6. Create a `System Environment Variable`, pointing to `<Python3 installation directory>\DLLs`.

7. Navigate to the project's root directory and run `python run.py` (ensue the Python Interpreter is the one in Step 2).

8. Open `http://127.0.0.1:5000/` or `http://localhost:5000/` in your favorite browser (Chrome for best results).

### Webapp Setup with Python3 in Ubuntu/Debian

1. Install the `python3-pip` and `virtualenv` library by running the command below:

   ```shell
   $ sudo apt-get install python3-pip
   $ pip3 install virtualenv 
   ```

2. Create and activate the virtual environment. 

   ```shell
   $ python3 -m venv wildfires
   $ source /wildfires/bin/activate
   ```

3. Install the libraries for the development by running the command below:

   ```shell
   $ pip3 install pandas numpy flask flask-sqlalchemy geojson spatialite
   ```

4. Update the system and  install the library.

   ```shell
   $ sudo apt update
   $ sudo apt install libsqlite3-mod-spatialite
   ```

5. Navigate to the project's root directory and run `python run.py` (ensue the Python Interpreter is the one in Step 2).

6. Open `http://127.0.0.1:5000/` or `http://localhost:5000/` in your favorite browser (Chrome for best results).

### Repo Structure

1. **data** folder: You can find SQLite database (`nbac.sqlite`) here. This is the folder we put all data in; 

    * An "`nbac_query.py`" code has been added querying the NBAC dataset.

2. **flaskapp** folder: This folder contains 2 subfolders

    2a) **templates**: contains main html file in Jinja format. We add loops, etc in addition to html, css and d3 codes.

    2b) **static**: contains css and d3 Javascript include files.

3. **scripts** folder: We add all python functions inside "**wrangling.py**" file.

4. **Setup** folder:  some files for setting up `spatialite` in Windows system.



### Credits

**Team-082 of CSE-6242 Fall 2021**

**David Tang, Hardipsinh Rana, Marcus Zou, Roman Auriti, Vahid Dehdari**
