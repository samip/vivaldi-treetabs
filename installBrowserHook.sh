#!/bin/bash

##############################################
# Author: GwenDragon
# License: GPL
##############################################

# not needed if browser.html is writable

# if [ $UID != 0 ] ; then
    # cho "Please use 'sudo' or log in as root."
    # exit 255
# fi

mod_dir=browserhook

# use this if supplied, otherwise select installation from prompt
vivaldi_dir=/opt/vivaldi-snapshot

if [ ! "$1" = "" ] ; then
    mod_dir=$1
fi

if [ "$vivaldi_dir" = "" ]; then
  vivaldi_installs=$(dirname $(find /opt -name "vivaldi-bin" )) ;
  vivaldi_install_dirs=( $vivaldi_installs ) ;

  echo "---------------------"
  count=1
  selected=0
  echo "Installations found:"
  for dir in $vivaldi_installs ; do
          echo $dir": "$count ;
          ((count++)) ;
  done
  read -p "
  Select installation to patch.
  Input number and press [Enter] or [X] to cancel.
  Input selection: " selected ;
  if [ "$selected" = "X" ] ; then
          exit ;
  fi
  ((selected--)) ;
  if [ $selected -ge ${#vivaldi_install_dirs[@]} ] ; then
      echo "Selection too large!"
  fi
  dir=${vivaldi_install_dirs[$selected]} ;
else
  dir=$vivaldi_dir
fi

echo "---------------------
"
echo "Patch originating from "${mod_dir}" targeting "${dir} ;

# backup browser.html
cp "$dir/resources/vivaldi/browser.html" "$dir/resources/vivaldi/browser.html-$(date +%Y-%m-%dT%H-%M-%S)"

alreadypatched=$(grep '<script src="vivaldiTabsBrowserHook.js"><\/script>' $dir/resources/vivaldi/browser.html);
if [ "$alreadypatched" = "" ] ; then
    echo patching browser.html
	sed -i -e 's/<\/body>/<script src="TabControl.js"><\/script> <script src="observer.js"><\/script>\n <script src="vivaldiTabsBrowserHook.js"><\/script>\n  <\/body>/' "$dir/resources/vivaldi/browser.html"

else
    echo "browser.html has already been patched!"
fi


if [ -f "$mod_dir/TabControl.js" ] ; then
    echo copying TabControl.js
    cp -f "$mod_dir/TabControl.js" "$dir/resources/vivaldi/TabControl.js"
else
    echo observer.js missing in $mod_dir
fi

if [ -f "$mod_dir/vivaldiTabsBrowserHook.js" ] ; then
    echo copying vivaldiTabsBrowserHook.js
    cp -f "$mod_dir/vivaldiTabsBrowserHook.js" "$dir/resources/vivaldi/vivaldiTabsBrowserHook.js"
else
    echo vivaldiTabsBrowserHook.js missing in $mod_dir
fi

if [ -f "$mod_dir/observer.js" ] ; then
    echo copying observer.js
    cp -f "$mod_dir/observer.js" "$dir/resources/vivaldi/observer.js"
else
    echo observer.js missing in $mod_dir
fi
