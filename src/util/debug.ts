import debug from 'debug';

export default function (namespace?: string) {
    let name = namespace ? `xinmi-${namespace}` : 'xinmi-default';
    return debug(name);
};