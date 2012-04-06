define \n

endef

modules = src/rAF.js\
          src/prefixes.js\
          src/transform.js\
          src/database.js\
          src/extend.js\
          src/timespan.js\
          src/timer.js\
          src/session.js\
          src/sessionlist.js\
          src/work_page.js\
          src/button.js\
          src/section.js\
          src/work.js\
          src/log.js\
          src/start.js\
          src/complete.js\
          src/page_load.js

js/atwork.js: ${modules}
	echo "/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */" > $@
	echo ${\n} >> $@
	echo "(function(undefined) {" >> $@
	echo "'use strict';" >> $@
	for mod in ${modules} ; do \
    cat >> $@ $$mod && echo ${\n} >> $@ ; \
	done
	echo "})();" >> $@
