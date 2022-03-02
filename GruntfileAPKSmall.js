module.exports = function (grunt) {

    /**
     * ¡IMPORTANTE! Setear URL de $RootFolder antes de compilar.
     * @type {string}
     */
    $RootFolder = 'C:/Users/dpalavecino/Desktop/Transener';

    $DestFolders = $RootFolder + '/movilidad_no_drone/SAPHybrid/transenermovilidad/hybrid/www';
    $DestFoldersENV = $RootFolder + '/movilidad_no_drone/SAPHybrid/transenermovilidad/hybrid/www/models';
    $VersionDESTFile = $RootFolder + '/movilidad_no_drone/SAPHybrid/transenermovilidad/hybrid/config.xml';
    $DestFolderGit = $RootFolder + '/transenermovilidad';
    $SrcFolders = ['css/**', 'helpers/**', 'i18n/**', 'img/**', 'less/**', 'mock_data/**', 'models/**', 'services/**', 'view/**'];
    $ReleaseCopyFolders = ['css/**', 'i18n/**', 'img/**', 'less/**', 'mock_data/**', 'models/**', 'services/**'];

    $CopyAllFolders = ['css/**', 'helpers/**', 'i18n/**', 'img/**', 'lib/**', 'mock_data/**', 'models/**', 'services/**', 'view/**'];

    $XmlpokeFile = {};
    $XmlpokeFile[$RootFolder + '/movilidad_no_drone/SAPHybrid/transenermovilidad/hybrid/config.xml'] = $RootFolder + '/movilidad_no_drone/SAPHybrid/transenermovilidad/hybrid/config.xml';

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
                    src: $CopyAllFolders,
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
                renameDebug: {
                    expand: true,
                    cwd: './',
                    src: [$RootFolder + "/movilidad_no_drone/SAPHybrid/transenermovilidad/hybrid/platforms/android/app/build/outputs/apk/debug/app-debug.apk"],
                    dest: $DestFoldersENV,
                    rename: function (dest, src) {
                        return $RootFolder + "/movilidad_no_drone/SAPHybrid/transenermovilidad/hybrid/platforms/android/app/build/outputs/apk/debug/" + grunt.option("versionAPK") + "-" + grunt.option("env") + "-noRelease.apk";
                    }
                },
                renameRelease: {
                    expand: true,
                    cwd: './',
                    src: [$RootFolder + "/movilidad_no_drone/SAPHybrid/transenermovilidad/hybrid/platforms/android/app/build/outputs/apk/release/app-release.apk"],
                    dest: $DestFoldersENV,
                    rename: function (dest, src) {
                        return $RootFolder + "/movilidad_no_drone/SAPHybrid/transenermovilidad/hybrid/platforms/android/app/build/outputs/apk/release/" + grunt.option("versionAPK") + "-" + grunt.option("env") + "-release.apk";
                    }
                }

            },
            shell: {// Run the apk
                multiple: {
                    command: [
                        'cd /',
                        'cd ' + $RootFolder + '/movilidad_no_drone/SAPHybrid/transenermovilidad/hybrid/www',
                        'cordova build android --release -- --keystore=C:/TransenerMovilidad.jks --storePassword=tatovp22 --alias=TransenerMovilidad --password=tatovp22'
                    ].join('&&')
                },
                openDir: {
                    command: [
                        'start ' + $RootFolder + '/movilidad_no_drone/SAPHybrid/transenermovilidad/hybrid/platforms/android/app/build/outputs/apk/debug'
                    ].join('&&')
                },
                openDirRelease: {
                    command: [
                        'start ' + $RootFolder + '/movilidad_no_drone/SAPHybrid/transenermovilidad/hybrid/platforms/android/app/build/outputs/apk/release'
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
                        'cd ' + $RootFolder + '/movilidad_no_drone/SAPHybrid/transenermovilidad/hybrid/www',
                        'cordova build android'
                    ].join('&&')
                },
                buildRelease: {
                    command: [
                        'cd /',
                        'cd ' + $RootFolder + '/movilidad_no_drone/SAPHybrid/transenermovilidad/hybrid/www',
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
                    src: $RootFolder + '/movilidad_no_drone/SAPHybrid/transenermovilidad/hybrid/www/project.json',
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
    // grunt.registerTask('buildForAndroid', ['uglify', 'copy:main', 'copy:release', 'shell:multiple', 'clean']);
    // grunt.registerTask('release', ['uglify', 'copy:main', 'copy:release', 'shell', 'clean']);
    // grunt.registerTask('buildAndRelease', ['copy:', 'copy:build', 'shell', 'clean']);
    // grunt.registerTask('buildQAS', ['copy:env', 'copy:build']);
    grunt.registerTask('setEnvironment', ['copy:env']);
    grunt.registerTask('changeVersion', ['xmlpoke']);
    grunt.registerTask('downloadChangesFromGit', ['shell:gitPull']);
    grunt.registerTask('build', ['shell:build', 'copy:renameDebug']);
    grunt.registerTask('build-release', ['uglify', 'shell:buildRelease', 'copy:renameRelease', 'clean']);
    // grunt.registerTask('build-release2', ['shell:build', 'copy:renameRelease', 'clean']);
    grunt.registerTask("changeProjectUrlConfiguration", ['replace_json']);
    grunt.registerTask("openDir", ["shell:openDir"]);
    grunt.registerTask("openDirRelease", ["shell:openDirRelease"]);
    // grunt.registerTask("ugly-solo",["uglify"]);
    grunt.registerTask("just-copy",["copy:build"]);

    grunt.registerTask("generarAPK", '', function (versionXML) {
        if (grunt.option("env") && grunt.option('versionAPK')) {
            grunt.log.write('TRANSENEER MOVILIDAD APK VERSION N° ------> ' + grunt.option("versionAPK"));
            grunt.task.run('downloadChangesFromGit');
            grunt.task.run('changeProjectUrlConfiguration');
            grunt.task.run('just-copy');
            grunt.task.run('changeVersion');
            grunt.task.run('setEnvironment');
            if (grunt.option("release")) {
                grunt.log.write('RELEASE ON');
                grunt.task.run('build-release');
                grunt.task.run('openDirRelease');
            } else {
                grunt.log.write('RELEASE OFF');
                grunt.task.run('build');
                grunt.task.run('openDir');
            }
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