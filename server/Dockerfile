FROM python:3.8
RUN pip install --upgrade pip
COPY src/requirements.txt /requirements.txt
RUN pip install --no-cache-dir -r  /requirements.txt
EXPOSE 8000
WORKDIR /src
COPY src ./
CMD ["python" , "main.py"]
