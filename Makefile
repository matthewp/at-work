define \n

endef

modules = js/bram.js\
          src/database.js\
          src/extend.js\
          src/visibility.js\
          src/timespan.js\
          src/timer.js\
          src/listener.js\
          src/session.js\
          src/button.js\
          src/action_bar.js\
          src/work.js\
          src/work_page.js\
          src/main_page.js\
          src/sessionlist.js\
          src/session_page.js\
          src/at_work.js\
          src/list_session_button.js\
          src/session_checkbox.js\
          src/actions.js\
          src/sessionlist_actions.js\
          src/utils.js\
          src/drawer_button.js\
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

all: js/atwork.js

watch:
	find src -name "*.js" | entr make all
