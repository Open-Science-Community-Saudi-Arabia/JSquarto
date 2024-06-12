export default class StringAlgo {
    static findStartAndEndOfSubstring(
        s: string,
        sub: string,
    ): [number, number] {
        const start = s.indexOf(sub);
        const end = start + sub.length;
        return [start, end];
    }
}
