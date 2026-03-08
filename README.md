# Crypto-Risk-Analyser
An engine to determine the risk metrics of a crypto portfolio.

# Instructions

The code is built using a react frontend built with vite and a FastAPI frontend.

First, copy the code onto your computer: `git clone https://github.com/paulbeka/Crypto-Risk-Analyser.git`

## Frontend

To run the frontend, you will need to use npm. To install npm on windows.

### Install npm on Windows

1. Download **Node.js (LTS)** from https://nodejs.org  
2. Run the installer and keep default settings.  
3. Finish installation.

npm is installed automatically with Node.js.

Check installation

```bash
node -v
npm -v
```

### Run the website

Open the command prompt and go to the folder with the code. cd into `/frontend`. Then run: `npm run dev`

## Backend

To run the backend, cd into the `/backend` directory. 

1. Create a new environment: `python -m venv venv`
2. Activate the venv: `venv\Source\activate` on Windows
3. Install dependencies: `pip install -r requirements.txt`
4. Run the app: `python -m uvirorn main:app`

