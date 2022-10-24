module.exports = function (grunt) {

	/**
	 * ¡IMPORTANTE! Setear URL de $RootFolder antes de compilar.
	 * @type {string}
	 */
	$RootFolder = 'C:/Users/dpalavecino/Desktop/Transener';

	$DestFolders = $RootFolder + '/movilidad_no_drone/www';
	$DestFoldersENV = $RootFolder + '/movilidad_no_drone/www/models';
	$SrcFolders = ['css/**', 'helpers/**', 'i18n/**', 'img/**', 'less/**', 'mock_data/**', 'models/**', 'services/**', 'view/**'];
	$ReleaseCopyFolders = ['css/**', 'i18n/**', 'img/**', 'less/**', 'mock_data/**', 'models/**', 'services/**'];
	$CopyAllFolders = ['css/**', 'helpers/**', 'i18n/**', 'img/**', 'lib/**', 'mock_data/**', 'models/**', 'services/**', 'view/**'];

	$XmlpokeFile = {};
	$XmlpokeFile[$RootFolder + '/movilidad_no_drone/config.xml'] = $RootFolder + '/movilidad_no_drone/config.xml';

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
					src: [$RootFolder + "/movilidad_no_drone/platforms/android/app/build/outputs/apk/debug/app-debug.apk"],
					dest: $DestFoldersENV,
					rename: function (dest, src) {
						return $RootFolder + "/movilidad_no_drone/platforms/android/app/build/outputs/apk/debug/" + grunt.option("versionAPK") + "-" + grunt.option("env") + "-noRelease.apk";
					}
				},
				renameRelease: {
					expand: true,
					cwd: './',
					src: [$RootFolder + "/movilidad_no_drone/platforms/android/app/build/outputs/apk/release/app-release.apk"],
					dest: $DestFoldersENV,
					rename: function (dest, src) {
						return $RootFolder + "/movilidad_no_drone/platforms/android/app/build/outputs/apk/release/" + grunt.option("versionAPK") + "-" + grunt.option("env") + "-release.apk";
					}
				}

			},
			shell: {// Run the apk
				multiple: {
					command: [
						'cd /',
						'cd ' + $RootFolder + '/movilidad_no_drone/www',
						'cordova build android --release -- --keystore=' + $RootFolder + '/TransenerMovilidad.jks --storePassword=tatovp22 --alias=TransenerMovilidad --password=tatovp22'
					].join('&&')
				},
				openDir: {
					command: [
						'start ' + $RootFolder + '/movilidad_no_drone/platforms/android/app/build/outputs/apk/debug'
					].join('&&')
				},
				openDirRelease: {
					command: [
						'start ' + $RootFolder + '/movilidad_no_drone/platforms/android/app/build/outputs/apk/release'
					].join('&&')
				},
				build: {
					command: [
						'cd /',
						'cd ' + $RootFolder + '/movilidad_no_drone/www',
						'cordova build android'
					].join('&&')
				},
				buildRelease: {
					command: [
						'cd /',
						'cd ' + $RootFolder + '/movilidad_no_drone/www',
						'cordova build android --release -- --keystore=' + $RootFolder + '/TransenerMovilidad.jks --storePassword=tatovp22 --alias=TransenerMovilidad --password=tatovp22'
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
					src: $RootFolder + '/movilidad_no_drone/www/project.json',
					changes: {
						"hybrid.server": grunt.option("env") === "qas" ? "mobile-da40b6a1b.us2.hana.ondemand.com" : "mobile-dfa572922.us2.hana.ondemand.com",
						"hybrid.hcpmsServer": grunt.option("env") === "qas" ? "mobile-da40b6a1b.us2.hana.ondemand.com" : "mobile-dfa572922.us2.hana.ondemand.com"
					}
				},
			},
			replace: {
				header: {
					src: [
						$RootFolder + '/movilidad_no_drone/www/view/workOrder/workOrderHeader/workOrderHeader.view.js',
						$RootFolder + '/transenermovilidad/view/workOrder/workOrderHeader/workOrderHeader.view.js'
					],
					overwrite: true,
					replacements: [{
						from: /("v)([0-9]{1,2})(.)([0-9]{1,2})(.)([0-9]{1,2}("))/g,
						to: '"v' + grunt.option("versionAPK") + '"'
					}]
				}
			}
		}
	);

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify-es');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-xmlpoke');
	grunt.loadNpmTasks('grunt-replace-json');
	grunt.loadNpmTasks('grunt-text-replace');

	grunt.registerTask('default', ['watch']);
	grunt.registerTask('setEnvironment', ['copy:env']);
	grunt.registerTask('changeVersion', ['xmlpoke', 'replace:header']);
	grunt.registerTask('build', ['shell:build', 'copy:renameDebug']);
	grunt.registerTask('build-release', ['uglify', 'shell:buildRelease', 'copy:renameRelease', 'clean']);
	grunt.registerTask("changeProjectUrlConfiguration", ['replace_json']);
	grunt.registerTask("openDir", ["shell:openDir"]);
	grunt.registerTask("openDirRelease", ["shell:openDirRelease"]);
	grunt.registerTask("just-copy", ["copy:build"]);

	grunt.registerTask("generarAPK", '', function (versionXML) {
		if (grunt.option("env") && grunt.option('versionAPK')) {
			grunt.log.write('Tansener movilidad APK v' + grunt.option("versionAPK"));
			grunt.task.run('changeProjectUrlConfiguration');
			grunt.task.run('just-copy');
			grunt.task.run('changeVersion');
			grunt.task.run('setEnvironment');

			if (grunt.option("release")) {
				grunt.log.write('Modo Release');
				grunt.task.run('build-release');
				grunt.task.run('openDirRelease');
			} else {
				grunt.log.write('Modo NO Release');
				grunt.task.run('build');
				grunt.task.run('openDir');
			}
		} else {
			const errorMSG =
				'NO SE HAN PASADO LOS PARAMETROS CORRECTOS\n' +
				'Por favor, ingresar el comando con la siguiente nomenclatura\n' +
				'Ejemplo: grunt generarAPK --versionAPK=0.1.26 --env=qas --release=true\n' +
				'Todos los comandos son requeridos para poder realizar la instalacion de manera correcta\n' +
				'--versionAPK especifica el numero de version que se quiere instalar\n' +
				'--env especifica el entorno al cual la aplicacion va a apuntar, solo hay dos parametros disponibles, qas y prd\n' +
				'--release especifica si se desea generar una apk con la firma digital o no, true para que se genere con firma digital y false para que no se genere con firma digital';
			grunt.log.error(errorMSG);
		}
	})


};