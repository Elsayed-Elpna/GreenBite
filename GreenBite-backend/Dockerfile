FROM python:3.11

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt
# COPY entrypoint.sh /app/entrypoint.sh
# RUN chmod +x /app/entrypoint.sh
# RUN python manage.py migrate
# commands in management commands 
COPY . /app



ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
