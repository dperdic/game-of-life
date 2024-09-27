#!/bin/bash

FILE_NAME="game_of_life"

IDL_FILE="$FILE_NAME.json"
TYPES_FILE="$FILE_NAME.ts"

# Source dirs
IDL_DIR="program/target/idl"
TYPES_DIR="program/target/types"

# Destination dir
FRONTEND_IDL_DIR="app/src/idls"

# Make destination dir if it does not exist
if [[ ! -d "$FRONTEND_IDL_DIR" ]]; then
  echo "Destination directory ($FRONTEND_IDL_DIR) does not exist. Creating directory..."
  mkdir $FRONTEND_IDL_DIR
fi

# Check if the source files exist
if [[ ! -f "$IDL_DIR/$IDL_FILE" ]]; then
  echo "Source JSON file ($IDL_FILE) does not exist."
  exit 1
fi

if [[ ! -f "$TYPES_DIR/$TYPES_FILE" ]]; then
  echo "Source TS file ($TYPES_FILE) does not exist."
  exit 1
fi

# Copy the contents of the source files to frontend idl dir
cp "$IDL_DIR/$IDL_FILE" "$FRONTEND_IDL_DIR/$IDL_FILE"
cp "$TYPES_DIR/$TYPES_FILE" "$FRONTEND_IDL_DIR/$TYPES_FILE"

echo "Contents of $IDL_DIR/$IDL_FILE have been copied to $FRONTEND_IDL_DIR/$IDL_FILE"
echo "Contents of $TYPES_DIR/$TYPES_FILE have been copied to $FRONTEND_IDL_DIR/$TYPES_FILE"
