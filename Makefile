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
          src/work.js\
          src/log.js\
          src/start.js\
          src/work_page.js\
          src/main_page.js\
          src/sessionlist.js\
          src/session_page.js\
          src/list_session_button.js\
          src/session_checkbox.js\
          src/actions.js\
          src/sessionlist_actions.js\
          src/complete.js\
          src/utils.js\
          src/drawer_button.js\
          src/navigator.js\
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
