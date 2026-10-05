PY ?= python
WEEK ?= 2026-W40
export PYTHONPATH := src

.PHONY: install demo generate run rerun test samples clean

install:            ## install dependencies
	$(PY) -m pip install -r requirements.txt

demo: clean generate run   ## fresh synthetic week -> report + exceptions (about 5 s)

generate:           ## write messy synthetic input files to landing/$(WEEK)
	$(PY) -m weekly_report.cli generate --week $(WEEK)

run:                ## build the report for $(WEEK); a no-op if inputs are unchanged
	$(PY) -m weekly_report.cli run --week $(WEEK)

rerun:              ## run again to show the safe re-run (skips unchanged weeks)
	$(PY) -m weekly_report.cli run --week $(WEEK)

test:               ## unit + end-to-end tests (no network)
	$(PY) -m pytest -q

samples: demo       ## refresh the committed sample outputs
	cp output/$(WEEK)/weekly_report_$(WEEK).xlsx output/$(WEEK)/exceptions_$(WEEK).xlsx output/run_log.jsonl sample_output/

clean:
	rm -rf landing output
