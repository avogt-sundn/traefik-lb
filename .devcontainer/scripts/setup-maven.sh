#!/usr/bin/env sh

mkdir -p $HOME/.m2 && cat > $HOME/.m2/settings.xml<<EOF

<settings>
    <mirrors>
        <mirror>
            <id>dockerized-mirror</id>
            <name>Local Mirror Repository</name>
            <url>http://maven-mirror:8080/central</url>
            <mirrorOf>central</mirrorOf>
        </mirror>
    </mirrors>
</settings>
EOF