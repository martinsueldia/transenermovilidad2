module.exports = function (grunt) {

    /**
     * ¡IMPORTANTE! Setear URL de $RootFolder antes de compilar.
     * @type {string}
     */
    $RootFolder = 'C:/Users/dpalavecino/Desktop/Transener';

    $DestFolders = $RootFolder + '/movilidad_drone/transenermovilidad/hybrid/platforms/android/assets/www';
    $DestProjectFolder = $RootFolder + '/movilidad_drone/transenermovilidad/hybrid/www';

    $DestFoldersENV = $RootFolder + '/movilidad_drone/transenermovilidad/hybrid/platforms/android/assets/www/models';
    $FoldersEnvProject = $RootFolder + '/movilidad_drone/transenermovilidad/hybrid/www/models';


    $VersionDESTFile = $RootFolder + '/movilidad_drone/transenermovilidad/hybrid/platforms/android/AndroidManifest.xml';
    $DestFolderGit = $RootFolder + '/transenermovilidad';
    $SrcFolders = ['css/**', 'helpers/**', 'i18n/**', 'img/**', 'less/**', 'mock_data/**', 'models/**', 'services/**', 'view/**'];
    $ReleaseCopyFolders = ['css/**', 'i18n/**', 'img/**', 'less/**', 'mock_data/**', 'models/**', 'services/**'];

    $XmlpokeFile = {};
    $XmlpokeFile[$RootFolder + '/movilidad_drone/transenermovilidad/hybrid/config.xml'] = $RootFolder + '/movilidad_drone/transenermovilidad/hybrid/config.xml';

    grunt.initConfig({
            ruta: $DestFolders,
            watch: {
                scripts: {
                    files: $SrcFolders,
                    tasks: ['copy:main', 'copy:release', 'copy:build'],
                    options: {
                        spawn: false,
                    },
                },
            },
            copy: {
                just: {
                    expand: true,
                    cwd: './',
                    src: $SrcFolders,
                    dest: $DestFolders
                },
                justCopyProject: {
                    expand: true,
                    cwd: './',
                    src: $SrcFolders,
                    dest: $DestProjectFolder
                },
                main: {
                    expand: true,
                    cwd: './',
                    src: $ReleaseCopyFolders,
                    dest: $DestFolders
                },
                release: {
                    expand: true,
                    cwd: './release',
                    src: ['helpers/**', 'view/**'],
                    dest: $DestFolders
                },
                build: {
                    expand: true,
                    cwd: './',
                    src: ['helpers/**', 'view/**'],
                    dest: $DestFolders
                },
                resourcesForBuild: {
                    expand: true,
                    cwd: './release',
                    src: ['resources/**'],
                    dest: $DestFolders
                },
                env: {
                    expand: true,
                    cwd: './',
                    src: ["models/env_" + grunt.option("env") + ".json"],
                    dest: $DestFoldersENV,
                    rename: function (dest, src) {
                        return dest + "/env.json";
                    }
                },
                env_project: {
                    expand: true,
                    cwd: './',
                    src: ["models/env_" + grunt.option("env") + ".json"],
                    dest: $FoldersEnvProject,
                    rename: function (dest, src) {
                        return dest + "/env.json";
                    }
                },
                renameDebug: {
                    expand: true,
                    cwd: './',
                    src: [$RootFolder + "/movilidad_drone/transenermovilidad/hybrid/platforms/android/build/outputs/apk/debug/android-debug.apk"],
                    dest: $DestFoldersENV,
                    rename: function (dest, src) {
                        return $RootFolder + "/movilidad_drone/transenermovilidad/hybrid/platforms/android/build/outputs/apk/debug/" + grunt.option("versionAPK") + "-" + grunt.option("env") + "-noRelease.apk";
                    }
                },
                renameRelease: {
                    expand: true,
                    cwd: './',
                    src: [$RootFolder + "/movilidad_drone/transenermovilidad/hybrid/platforms/android/build/outputs/apk/release/android-release.apk"],
                    dest: $DestFoldersENV,
                    rename: function (dest, src) {
                        return $RootFolder + "/movilidad_drone/transenermovilidad/hybrid/platforms/android/build/outputs/apk/release/" + grunt.option("versionAPK") + "-" + grunt.option("env") + "-release.apk";
                    }
                }

            },
            shell: {// Run the apk
                multiple: {
                    command: [
                        'cd /',
                        'cd C:/Users/dpalavecino/Desktop/Transener/transenermovilidad/hybrid/www',
                        'cordova build android --release -- --keystore=C:/TransenerMovilidad.jks --storePassword=tatovp22 --alias=TransenerMovilidad --password=tatovp22'
                    ].join('&&')
                },
                openDir: {
                    command: [
                        'start ' + $RootFolder + '/movilidad_drone/transenermovilidad/hybrid/platforms/android/build/outputs/apk/release'
                    ].join('&&')
                },
                gitPull: {
                    command: [
                        'cd ' + $RootFolder + '/transenermovilidad',
                        'git pull origin develop'
                    ].join('&&')
                },
                build: {
                    command: [
                        'cd /',
                        'cd C:/Users/dpalavecino/Desktop/Transener/transenermovilidad/hybrid/www',
                        'cordova build android'
                    ].join('&&')
                },
                buildRelease: {
                    command: [
                        'cd /',
                        'cd C:/Users/dpalavecino/Desktop/Transener/transenermovilidad/hybrid/www',
                        'cordova build android --release -- --keystore=C:/TransenerMovilidad.jks --storePassword=tatovp22 --alias=TransenerMovilidad --password=tatovp22'
                    ].join('&&')
                },
            },
            uglify: {
                minify_helpers_folder: {
                    files: [{
                        expand: true,
                        cwd: 'helpers',
                        src: '**/*.js',
                        dest: 'release/helpers'
                    }]
                },
                minify_view_folder: {
                    files: [{
                        expand: true,
                        cwd: 'view',
                        src: '**/*.js',
                        dest: 'release/view'
                    }]
                }
            },
            clean: {// Delete the temporary "release" folder
                release: {
                    src: ['./release/**/**', './release']
                }
            },
            xmlpoke: {
                widget: {
                    options: {
                        namespaces: {
                            'w': 'http://www.w3.org/ns/widgets',
                            'cdv': 'http://cordova.apache.org/ns/1.0'
                        },
                        replacements: [{
                            xpath: '/w:widget/@version',
                            value: grunt.option("versionAPK")
                        }]
                    },
                    files: $XmlpokeFile
                },
            },
            replace_json: {
                hybrid: {
                    src: $RootFolder + '/movilidad_drone/transenermovilidad/hybrid/platforms/android/assets/www/project.json',
                    changes: {
                        "hybrid.server": grunt.option("env") === "qas" ? "mobile-da40b6a1b.us2.hana.ondemand.com" : "mobile-dfa572922.us2.hana.ondemand.com",
                        "hybrid.hcpmsServer": grunt.option("env") === "qas" ? "mobile-da40b6a1b.us2.hana.ondemand.com" : "mobile-dfa572922.us2.hana.ondemand.com"
                    }
                },
                hybrid_project: {
                    src: $RootFolder + '/movilidad_drone/transenermovilidad/hybrid/www/project.json',
                    changes: {
                        "hybrid.server": grunt.option("env") === "qas" ? "mobile-da40b6a1b.us2.hana.ondemand.com" : "mobile-dfa572922.us2.hana.ondemand.com",
                        "hybrid.hcpmsServer": grunt.option("env") === "qas" ? "mobile-da40b6a1b.us2.hana.ondemand.com" : "mobile-dfa572922.us2.hana.ondemand.com"
                    }
                },
            },
        }
    );

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-xmlpoke');
    grunt.loadNpmTasks('grunt-replace-json');

    grunt.registerTask('default', ['watch']);
    grunt.registerTask('buildForAndroid', ['uglify', 'copy:main', 'copy:release', 'shell:multiple', 'clean']);
    grunt.registerTask('release', ['uglify', 'copy:main', 'copy:release', 'shell', 'clean']);
    grunt.registerTask('buildAndRelease', ['copy:', 'copy:build', 'shell', 'clean']);
    grunt.registerTask('buildQAS', ['copy:env', 'copy:build']);
    grunt.registerTask('downloadChangesFromGit', ['shell:gitPull']);
    grunt.registerTask('build', ['copy:build']);
    grunt.registerTask('build-release', ['uglify', 'copy:build', 'shell:buildRelease', 'copy:renameRelease', 'clean']);
    grunt.registerTask('build-release2', ['shell:build', 'copy:renameRelease', 'clean']);
    grunt.registerTask("openDir", ["shell:openDir"]);
    grunt.registerTask("ugly-solo",["uglify"]);
    grunt.registerTask("just-copy",["copy:just"]);

    grunt.registerTask("changeProjectUrlConfiguration", ['replace_json']);
    grunt.registerTask('setEnvironment', ['copy:env']);
    // Used
    grunt.registerTask("change-project-url-config", ['replace_json:hybrid']);
    grunt.registerTask('changeVersion', ['xmlpoke']);
    grunt.registerTask('set-environment', ['copy:env']);
    grunt.registerTask("just-copy-project",["copy:just"]);

    grunt.registerTask("generarAPK", '', function (versionXML) {
        if (grunt.option("env") && grunt.option('versionAPK')) {
            grunt.log.write('TRANSENEER MOVILIDAD APK VERSION N° ------> ' + grunt.option("versionAPK"));
            grunt.task.run('change-project-url-config');
            grunt.task.run('changeVersion');
            grunt.task.run('just-copy-project');
            grunt.task.run('set-environment');
            grunt.log.write('TRANSENEER MOVILIDAD APK VERSION N° ------> ' + grunt.option("versionAPK"));
        }
        else {
            grunt.log.error("NO SE HAN PASADO LOS PARAMETROS CORRECTOS");
            grunt.log.error("Por favor, ingresar el comando con la siguiente nomenclatura");
            grunt.log.error("EJEMPLO ---> 'grunt generarAPK --versionAPK=0.1.26 --env=qas --release=true' ");
            grunt.log.error("Todos los comandos son requeridos para poder realizar la instalacion de manera correcta");
            grunt.log.error("--versionAPK especifica el numero de version que se quiere instalar");
            grunt.log.error("--env especifica el entorno al cual la aplicacion va a apuntar, solo hay dos parametros disponibles, 'qas' y 'prd' ");
            grunt.log.error("--release especifica si se desea generar una apk con la firma digital o no, true para que se genere con firma digital y false para que no se genere con firma digital");
        }
    })


};