#!/bin/bash

# CentOS 7 Python 3.11 Installation Script (Multi-version coexistence)
# Run as root

set -e

echo "=== Updating system and installing dependencies ==="
yum update -y
yum groupinstall -y "Development Tools"
yum install -y openssl-devel bzip2-devel libffi-devel xz-devel wget

echo "=== Downloading Python 3.11.9 ==="
cd /usr/src
wget https://www.python.org/ftp/python/3.11.9/Python-3.11.9.tgz
tar xzf Python-3.11.9.tgz

echo "=== Compiling Python 3.11 (Alt Install) ==="
cd Python-3.11.9
# --enable-optimizations is slower but recommended for performance
# --with-ssl is crucial for pip and telegram bot
./configure --enable-optimizations --with-ssl

# make altinstall prevents replacing the system /usr/bin/python
make altinstall

echo "=== Verifying Installation ==="
python3.11 --version

echo "=== Cleanup ==="
cd ..
rm -rf Python-3.11.9 Python-3.11.9.tgz

echo "=== Setup Virtual Environment for Project ==="
echo "You can now create a virtual environment with Python 3.11:"
echo "python3.11 -m venv venv"
echo "source venv/bin/activate"
echo "pip install -r requirements.txt"
