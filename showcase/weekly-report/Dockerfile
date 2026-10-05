FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY config config
COPY src src
ENV PYTHONPATH=/app/src
# Demo: generate a synthetic week, then build its report into /app/output (mount it to keep the files).
# For real data, mount your drop folder at /app/landing and run:  python -m weekly_report.cli run
CMD ["sh", "-c", "python -m weekly_report.cli generate && python -m weekly_report.cli run --week 2026-W40"]
