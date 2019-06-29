#!/bin/bash

##############################################
# Author: GwenDragon
# License: GPL
##############################################

DEFAULT_ACTION="install"
OPTS=`getopt -o mta: --long action:,moddir:,target: -n 'parse-options' -- "$@"`

if [ $? != 0 ] ; then echo "Failed parsing options." >&2 ; exit 1 ; fi

eval set -- "$OPTS"

MODDIR='browserhook';
TARGET=;
HELP=false

while true; do
  case "$1" in
    -a | --action ) RUN_TYPE="$2"; shift; shift ;;
    -m | --moddir ) MODDIR="$2"; shift ; shift ;;
    -t | --target ) TARGET="$2"; shift; shift ;;

    -- ) shift; break ;;
    * ) echo "Invalid option ${1}" ; break ;;
  esac
done


# if ("{$POSITIONAL}" == "delete"

echo "RUN_TYPE = ${RUN_TYPE}"
echo "TARGET  = ${TARGET}"
echo "MODDIR     = ${MODDIR}"

if [[ -n $1 ]]; then
    echo "Last line of file specified as non-opt/last argument:"
    tail -1 "$1"
fi





mod_dir=$MODDIR;


if [ -z $TARGET ] ; then
  vivaldi_installs=$(dirname $(find /opt -name "vivaldi-bin" )) ;
  vivaldi_install_dirs=( $vivaldi_installs ) ;
  silent=1

  echo "---------------------"
  count=1
  selected=0

  echo "Installations found:"

  for dir in $vivaldi_installs ; do
    autoselected=""
    if [ "$TARGET" = "$dir" ] ; then
      autoselected="autoselected";
      target_dir=$dir;
    fi
    echo $autoselected " (" $count")  " $dir;
    ((count++)) ;
  done

  echo "target_dir " {$target_dir};

  if [ "$target_dir" = "" ] ; then
    if [ ! "$TARGET" = "" ]; then
      echo $target_dir ' does not contain vivaldi-bin. Aborting';
      exit 1;
    fi

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
    target_dir=${vivaldi_install_dirs[$selected]} ;
  fi

else # TARGET was set
  target_dir=$TARGET;
fi;

function is_patched() {
  browser_file=$1;
  alreadypatched=$(grep '$script_tag' $browser_file);
  return "$alreadypatched" = "";

}

echo "---------------------
"
echo "Patch originating from "${mod_dir}" targeting "${target_dir};
delete=0;
# backup browser.html
browser_file=$target_dir"resources/vivaldi/browser.html"
cp "$browser_file" "$browser_file-$(date +%Y-%m-%dT%H-%M-%S)";
if [ $? -eq 0 ]; then # cp ok
    echo "OK";
else
  echo 'backup failed';
  exit 3;
fi;
hook_name="vivaldiTabsBrowserHook.js";
script_tag_sed= echo "<script src=\"hook_name\"><\/script>";
  set -x;
alreadypatched=$(grep "${script_tag_sed}" $browser_file@);
echo $alreadypatched;
if [ "$alreadypatched" = "" ] ; then
    echo "patching browser.html";

    ser_part='s/<\/body>/"${script_tag_seds}/"<\/body>\';
	  echo $?;

    echo "browser.html patched";
    exit;

    exit 0;
else
     echo "browser.html has already been patched!"
    if [ RUN_TYPE =  "delete" ] ; then

      deleted=$("sed -i -e $'s/"$script_tag"/''/' $browser_file");
      if [ eval $deleted != "" ] ; then
        echo "deleted";
      fi
    fi
fi


if [ -f "$mod_dir/$hook_name" ] ; then
  source=$mod_dir/$hook_name;
  target=$target_dir/resources/vivaldi/$hook_name;
  if [ "$RUN_TYPE" = "delete" ]; then
    echo "deleting " $target;
    rm $target;
  else
    cp -f "$source" "$target"
  fi

  if [ $? -eq 0 ]; then # cp ok
    echo "OK";
  else
    echo "copying failed";
  fi
else
    echo "vivaldiTabsBrowserHook.js missing in $mod_dir"
fi #


