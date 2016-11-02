const path = require( 'path' );
const fs = require( 'fs' );

const semver = require( 'semver' );
const archiver = require( 'archiver' );

const ALLOWED_TYPES = [
    'major',
    'minor',
    'none',
    'patch',
];

const argv = require( 'minimist' )( process.argv.slice( 2 ) );

const incrementVersion = function incrementVersion(){
    const packagePath = path.join( __dirname, '../package.json' );
    const manifestPath = path.join( __dirname, '../plugin/manifest.json' );

    const packageData = JSON.parse( fs.readFileSync( packagePath, 'utf8' ) );
    const manifestData = JSON.parse( fs.readFileSync( manifestPath, 'utf8' ) );

    packageData.version = semver.inc( packageData.version, argv[ 'type' ] );
    manifestData.version = semver.inc( manifestData.version, argv[ 'type' ] );

    fs.writeFileSync( packagePath, JSON.stringify( packageData, null, 4 ) );
    fs.writeFileSync( manifestPath, JSON.stringify( manifestData, null, 4 ) );
};

const buildZip = function buildZip(){
    const output = fs.createWriteStream( path.join( __dirname, '../plugin-chrome.zip' ) );
    const archive = archiver.create( 'zip', {} );

    output.on( 'close', function() {
        console.log( archive.pointer() + ' total bytes' );
        console.log( 'Archiver has been finalized and the output file descriptor has closed.' );
    });

    archive.on( 'error', function( error ) {
        throw error ;
    });

    archive.pipe( output );

    archive.bulk([{
        expand: true,
        cwd: path.join( __dirname, '../plugin/' ),
        src: [ '**' ]
    }]);

    archive.finalize();
};

if( typeof argv[ 'type' ] === 'undefined' ){
    argv[ 'type' ] = 'patch';
}

if( ALLOWED_TYPES.indexOf( argv[ 'type' ] ) === -1 ){
    console.error( 'Invalid type specified' );
    process.exit( 1 );
}

if( argv[ 'type' ] !== 'none' ){
    incrementVersion();
}

buildZip();
