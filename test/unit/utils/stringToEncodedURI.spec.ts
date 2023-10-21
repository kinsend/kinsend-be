import { isSegmentURIEncoded, stringToEncodedURI } from "../../../src/utils/stringToEncodedURI";

describe("uriUtil", () => {

  it('should detect encoded URI segments', () => {
    const encoded1 = "c%23"
    const encoded2 = "c%23d"
    expect(isSegmentURIEncoded(encoded1)).toBeTruthy();
    expect(isSegmentURIEncoded(encoded2)).toBeTruthy();
  })

  it('should detect decoded/raw URI segments', () => {
    const decoded1 = "c#"
    const decoded2 = "c#d"
    expect(isSegmentURIEncoded(decoded1)).toBeFalsy();
    expect(isSegmentURIEncoded(decoded2)).toBeFalsy();
  })

  it('should return the same url', () => {
    const expected = "https://a.b/c/d/e";
    const result = stringToEncodedURI(expected);
    expect(result).toEqual(expected);
  });

  it('should encode # symbols inside path segment', () => {
    const expected = "https://a.b/c%23/d!/1697736474704%231.jpg"
    const result = stringToEncodedURI("https://a.b/c#/d!/1697736474704#1.jpg")
    expect(result).toEqual(expected);
  })

  it('should return the same url for already encoded urls', () => {
    const expected = "https://a.b/c%23/d!/1697736474704%231.jpg";
    expect(stringToEncodedURI(expected)).toEqual(expected);
  });

  it('should preserve handle query strings and URI fragments', () => {
    const expected = "https://a.b/c%23/d!/1697736474704%231.jpg?a=b&c=d#fragment=one"
    const result = stringToEncodedURI("https://a.b/c#/d!/1697736474704#1.jpg?a=b&c=d#fragment=one")
    expect(result).toEqual(expected);
  })

  it('should return the same url for already encoded urls', () => {
    const expected = "https://a.b/c%23/d!/1697736474704%231.jpg?a=b&c=d#fragment=one"
    expect(stringToEncodedURI(expected)).toEqual(expected);
  });

  it('should allow no schema host', () => {
    const expected = "www.domain.com";
    expect(stringToEncodedURI(expected)).toEqual(expected);
  })

  it('should allow no schema host with path', () => {
    const expected = "www.domain.com/a/b/c%23/d";
    const result = stringToEncodedURI("www.domain.com/a/b/c#/d");
    expect(stringToEncodedURI(result)).toEqual(expected);
  })

  it('should allow no schema host with path, query and fragment', () => {
    const expected = "www.domain.com/a/b/c%23/d?a=&c=d#fragment=one";
    const result = stringToEncodedURI("www.domain.com/a/b/c#/d?a=&c=d#fragment=one");
    expect(stringToEncodedURI(result)).toEqual(expected);
  })

  it('should return empty string on blank/null input', () => {
    expect(stringToEncodedURI(null)).toBe("");
    expect(stringToEncodedURI("")).toBe("");
    expect(stringToEncodedURI("   ")).toBe("");
  })

});