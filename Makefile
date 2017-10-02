.PHONY: all
all: couchdb/_auth.json couchdb/tags.json

couchdb/_auth.json: couchdb/_auth.tmpl.json couchdb/_auth.js
	jq --argjson fun "$$(jq -sR . couchdb/_auth.js)" '.validate_doc_update=$$fun' couchdb/_auth.tmpl.json > $@

couchdb/tags.json: couchdb/tags.tmpl.json couchdb/tags.autocompletion.map.js
	jq --argjson fun "$$(jq -sR . couchdb/tags.autocompletion.map.js)" '.views.autocompletion.map=$$fun' couchdb/tags.tmpl.json > $@
