const {execSync} = require('child_process');
let [start, end] = process.argv.slice(2);
if (!start || !end)  {
    console.error('Must provide start and end tags');
    console.error('  eg: v1.0 HEAD');
    console.error('  eg: v1.0 v2.0');
    process.exit(1);
}
const separator = `===END===`;
const res = execSync(`git log -E --format=%H%n%s%b===END=== ${start}..${end}`);
const sep = res.toString().split(separator);
const output = sep
    .map((item, i) => {
        const [hash, ...body] = getParts(item, i);
        const bodyJoined = body.join('\n');
        return [hash, bodyJoined];
    })
    // .filter(([, body]) => )
    .map(([hash, bodyJoined]) => {
        const hasSection = /^[\w]+: [^ ]/.test(bodyJoined);
        if (hasSection) {
            const [section, body] = bodyJoined.split(/: /);
            return [hash, section, body];
        }
        return [hash, 'misc', bodyJoined];
    })
    .reduce((acc, item) => {
        const [, section] = item;
        if (!acc[section]) {
            acc[section] = [item];
        } else {
            acc[section].push(item);
        }
        return acc;
    }, {});

if (process.argv.indexOf('--json') > -1) {
    console.log(JSON.stringify(output, null, 2));
} else {
    Object.keys(output)
        .map(x => [x, output[x]])
        .forEach(([section, items]) => {
            const header = `**${section}**`;
            console.log(header);
            items.forEach(([hash, section, body]) => {
                console.log(`- ${body} ${hash}`)
            });
            console.log('')
        });
}



function getParts(item, index) {
    const segs = item.split('\n');
    if (index === 0) return segs;
    return segs.slice(1);
}