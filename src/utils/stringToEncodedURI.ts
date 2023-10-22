/**
 * <p>This function takes a URL (i.e. https://a/b/c#/d/e/file#name.jpg) and
 * makes sure all segments in the path are URI encoded.</p>
 *
 * <p>NOTE: This function does not handle edge cases in which you have <a href="https://en.wikipedia.org/wiki/URI_fragment">URI fragments</a>.
 * It was initially designed to be used in the {@link RedirectController}</p>.
 *
 * @param raw
 * @return string URI encoded string
 */
export function stringToEncodedURI(raw: string|null) {

  if(raw === null || raw.match(/^( *)$/i)) {
    return "";
  }

  let url = raw;
  let queryString = "";
  if(raw.indexOf("?") > -1) {
    queryString = raw.substring(raw.indexOf("?"), raw.length);
    url = raw.substring(0, raw.indexOf("?"));
  }

  let fragmentString = "";
  const fragmentStringPosition = queryString.indexOf("#");
  if(fragmentStringPosition > -1) {
    // save the fragment string
    fragmentString = queryString.substring(fragmentStringPosition, queryString.length);

    // remove the fragment string from the query string.
    queryString = queryString.substring(0, fragmentStringPosition);
  }

  const hasSchema = url.indexOf("://") > -1;
  const segments = url.split("/").filter(n => n) // remove empty strings.

  if(segments.length < 1) {
    throw new Error("Provided string URL cannot be split by separator `/`. Maybe invalid URL?")
  }

  let host: string;
  if(hasSchema) {
    host = segments[0] + "//" + segments[1];
    segments.shift(); // remove schema part
  } else {
    host = segments[0]; // because there is no http(s)?:// in the beginning.
  }

  segments.shift(); // remove domain part

  const remaining: string[] = [];

  for(let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    let encoded = segment;
    // prevent double encoding.
    if(!isSegmentURIEncoded(segment)) {
      encoded = encodeURIComponent(segment);
    }
    remaining.push(encoded);
  }

  let reconstructed = host;

  if(remaining.length > 0) {
    reconstructed += "/" + remaining.join("/")
  }

  return reconstructed + queryString + fragmentString;

}

/**
 * Detect if a given path segment has already been encoded. Encoded segments
 * usually have percentage followed by a digit (i.e. `c%23` == `c#`)
 *
 * @param segment
 */
export function isSegmentURIEncoded(segment: string) {
  return segment.match(/(\w*)%([0-9]+)(\w*)/i);
}
