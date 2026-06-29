FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-venv ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY requirements-tts.txt ./
RUN python3 -m venv /opt/edge-tts-venv \
  && /opt/edge-tts-venv/bin/pip install --no-cache-dir -r requirements-tts.txt

COPY scripts ./scripts

ENV EDGE_TTS_PYTHON=/opt/edge-tts-venv/bin/python
ENV HOST=0.0.0.0
EXPOSE 10000

CMD ["npm", "run", "tts"]
