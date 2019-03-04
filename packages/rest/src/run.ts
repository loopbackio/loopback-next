import {RestApplication, RestServer, RestServerConfig, get} from '.';

function givenApplication(options?: {rest: RestServerConfig}) {
    options = options || {rest: {port: 4000, host: '127.0.0.1'}};
    return new RestApplication(options);
}

async function main() {
    let restApp = givenApplication();
    class PingController {
        @get('/ping')
        ping(): string {
            return 'Hi';
        }
        @get('/bye')
        bye(): string {
            return 'Bye';
        }
    }
    restApp.controller(PingController);
    restApp.redirect('/ping',(protocol:string, host:string, basePath:string)=>{
        console.log(protocol+host+basePath);
        return protocol+'://'+host+basePath+'/bye';
    });
    //restApp.redirect('/ping','/bye');
    await restApp.start();
}

main();