#!/bin/bash

##############################################
# Author: GwenDragon
# License: GPL
##############################################


mod_dir=userscript

# use this if supplied, otherwise select installation from prompt
echo "$1"
if [ ! "$1" = "" ] ; then
  vivaldi_dir=$1
else
  vivaldi_dir=/opt/vivaldi-snapshot
  vivaldi_dir=/opt/vivaldi
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

userscript_file='treetabs.js'
cp "$dir/resources/vivaldi/browser.html" "$dir/resources/vivaldi/browser.html-$(date +%Y-%m-%dT%H-%M-%S)"
cp "$dir/resources/vivaldi/$userscript_file" "$dir/resources/vivaldi/$userscript_file-$(date +%Y-%m-%dT%H-%M-%S)"
cp -f "dist/$userscript_file" "$dir/resources/vivaldi/"

alreadypatched=$(grep "<script src="\"$userscript_file\""><\/script>" $dir/resources/vivaldi/browser.html);
if [ "$alreadypatched" = "" ] ; then
    echo patching browser.html
	sed -i -e "s/<\/body>/  <script src=\""$userscript_file\""><\/script>\n  <\/body>/" "$dir/resources/vivaldi/browser.html"

else
    echo "browser.html has already been patched!"
fi
