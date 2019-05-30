#!/bin/bash

##############################################
# Author: GwenDragon
# License: GPL
##############################################

if [ $UID != 0 ] ; then
    echo "Please use 'sudo' or log in as root."
    exit 255
fi

mod_dir=browserhook
if [ ! "$1" = "" ] ; then
    mod_dir=$1
fi

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
echo "---------------------
"
echo "Patch originating from "${mod_dir}" targeting "${vivaldi_install_dirs[$selected]} ;

# backup browser.html
cp "$dir/resources/vivaldi/browser.html" "$dir/resources/vivaldi/browser.html-$(date +%Y-%m-%dT%H-%M-%S)"

alreadypatched=$(grep '<script src="vivaldiTabsBrowserHook.js"><\/script>' $dir/resources/vivaldi/browser.html);
if [ "$alreadypatched" = "" ] ; then
    echo patching browser.html
	# sed -i -e 's/<\/head>/<link rel="stylesheet" href="style\/custom.css" \/> <\/head>/' "$dir/resources/vivaldi/browser.html"
	sed -i -e 's/<\/body>/<script src="vivaldiTabsBrowserHook.js"><\/script> <\/body>/' "$dir/resources/vivaldi/browser.html"
else
    echo "browser.html has already been patched!"
fi


if [ -f "$mod_dir/vivaldiTabsBrowserHook.js" ] ; then	
    echo copying custom.js
    cp -f "$mod_dir/vivaldiTabsBrowserHook.js" "$dir/resources/vivaldi/vivaldiTabsBrowserHook.js"
else 
    echo vivaldiTabsBrowserHook.js missing in $mod_dir
fi