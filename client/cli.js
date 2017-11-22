require('yargs')
.option('server',{
    alias: 's',
    describe: 'cloud servername',
    demandOption: true,
    default: 'knot-test.cesar.org.br'
})
.option('port',{
    alias: 'p',
    describe: 'cloud port',
    demandOption: true,
    default: '3000'
})
.option('uuid',{
    alias: 'u',
    describe: 'owner uuid',
    demandOption: true
})
.option('token',{
    alias: 't',
    describe: 'owner token',
    demandOption: true
})
.option('event-flags',{
    alias: 'ef',
    describe: 'knot event flags, for more information consults knotd documentation',
    choices: Array.from(Array(15).keys(), (x,i) => i+1),
    default: 8
})
.option('time-sec',{
    alias: 'ts',
    describe: 'time in seconds to to send a data',
    default: 0
})
.option('lower-limit',{
    alias: 'll',
    describe: 'lower limit to send a value',
    default: 0
})
.option('upper-limit',{
    alias: 'ul',
    describe: 'upper limit to send a value',
    default: 0
})
.commandDir('cmds')
.demandCommand()
.alias('h', 'help')
.help()
.argv