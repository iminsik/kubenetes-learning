# Kubenetes-Learning
It's a repository to track down my kubernetes learning progress.

# Git Markdown Syntax
I am learning Markdown syntax [here](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) in writing this Markdown.

# Resources
1. [Docker toolbox](https://www.docker.com/products/docker-toolbox)
   Install 'docker toolbox' turning off Hyper-V option, if you run Windows 10.

2. [Minikube] (https://github.com/kubernetes/minikube/releases)
   Download the latest minikube and rename/move it to c:\windows\minikube.exe. Minikube runs single-node kubenetes cluster on your local machine in VirtualBox. 

3. [Kubectl] (https://github.com/eirslett/kubectl-windows/releases/tag/v1.5.0)
   Download the 1.5.0 version and move it to c:\windows\kubectl.exe

# Start Single-node Kubernetes with Minikube
1. Run 'Docker Quick Start Terminal' to create and initialize 'default' docker virtualbox.
2. Open 'Powershell' and run 'minikube start'. It creates 'minikube' or 'minikubeVM' instance in VirtualBox.

# TODO
## TODO 1: Build my own node js and deploy it to Kubernetes
- A very simple 'hello world' - [iminsik/node-hello-app](https://hub.docker.com/r/iminsik/node-web-app/) was built and pushed to Docker Hub.

```javascript
// docker/server.js
'use strict';

const express = require('express'),
      PORT = 8080,
      app = express();

app.get('/', function (req, res) {
	res.send('Hello World\n');
});

app.listen(PORT);
```

- The docker image could be deployed to local single-node minikube cluster with 10 replicas set.
```yml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: helloworld-deployment
spec:
  replicas: 10 
  template:
    metadata:
      labels:
        app: helloworld
    spec:
      containers:
      - name: iminsik 
        image: iminsik/node-web-app 
        ports:
        - name: nodejs-port
          containerPort: 3000
```

```bash
kubectl create -f kubernetes-yaml/deployment/helloworld.yml
```
![helloworld-deployment](https://github.com/iminsik/kubenetes-learning/blob/master/GIF/helloworld-deployment.gif)
You can see more instructions on [Kubernetes Dashboard](https://kubernetes.io/docs/user-guide/ui/)

## TODO 2: deploy the helloworld app with health check
- The docker image could be deployed to local single-node minikube cluster with 10 replicas set.
```yml
#deployment/helloworld-deployment-healthcheck.yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: helloworld-deployment
spec:
  replicas: 10 
  template:
    metadata:
      labels:
        app: helloworld
    spec:
      containers:
      - name: iminsik 
        image: iminsik/node-web-app 
        ports:
        - name: nodejs-port
          containerPort: 8080
        #BEGIN: Checking App Health
        livenessProbe:
          httpGet:
            path: /
            port: nodejs-port
          initialDelaySeconds: 10
          timeoutSeconds: 20
        #END:
```

```bash
kubectl create -f kubernetes-yaml/deployment/helloworld-healthcheck.yml
```

## TODO 3: deploy the helloworld app to specific node with selector
I've added 'deployment/helloworld-nodeselector.yml' example, but still can't figure out how I can assign the selector to each node. I will take a look at tutorial again.

## TODO 4: create secrets and use it in helloworld app.
Create a secrete for username and password encoded as BASE64.
```yml
#deployment/helloworld-secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secrets
type: Opaque
data:
  username: cm9vdA==
  password: cGFzc3dvcmQ=
```

Map the secrets to '/etc/creds/' directory in 'helloworld' app. 'username' is mapped to '/etc/creds/username', and 'password' mapped to '/etc/creds/password'.
```yml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: helloworld-deployment
spec:
  replicas: 3
  template:
    metadata:
      labels:
        app: helloworld
    spec:
      containers:
      - name: iminsik
        image: iminsik/node-web-app
        ports:
        - name: nodejs-port
          containerPort: 8080
        volumeMounts:
        - name: cred-volume
          mountPath: /etc/creds
          readOnly: true
      volumes:
      - name: cred-volume
        secret: 
          secretName: db-secrets
```

# TODO: create service for the app
