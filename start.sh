while : ;
do
    if [[ -f time.txt ]]; then
        node index.js "$1"
        echo "Sleeping for $(cat time.txt) seconds"
        sleep "$(cat time.txt)"
        getcat="$(cat time.txt)"
        newtime=$(((getcat+2)*2))
        echo "$newtime" > time.txt
        echo "time.txt: $newtime"
    fi
done