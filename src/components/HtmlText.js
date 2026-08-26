// The target scheme fields go through Utils.setHtmlTextView -> Html.fromHtml, so the server
// can send <b>, <i>, <u>, <br> and <font color="..."> inside the title, subtext, expiry label,
// current value and milestone values. This renders the same subset.
import React from 'react';
import { Text } from 'react-native';

const TOKEN = /<\s*(\/?)\s*(b|strong|i|em|u|br|font|span)([^>]*)>/gi;

function decode(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8377;/g, '₹');
}

export default function HtmlText({ html, style, boldFamily, italicStyle, ...rest }) {
  if (html == null) return null;
  const src = String(html);
  const out = [];
  let cursor = 0;
  let key = 0;
  const stack = [];

  const push = (text) => {
    if (!text) return;
    const bold = stack.some((f) => f.bold);
    const italic = stack.some((f) => f.italic);
    const underline = stack.some((f) => f.underline);
    const colorFrame = [...stack].reverse().find((f) => f.color);
    out.push(
      <Text
        key={key++}
        style={[
          bold && boldFamily ? { fontFamily: boldFamily } : null,
          bold && !boldFamily ? { fontWeight: 'bold' } : null,
          italic ? italicStyle ?? { fontStyle: 'italic' } : null,
          underline ? { textDecorationLine: 'underline' } : null,
          colorFrame ? { color: colorFrame.color } : null,
        ]}
      >
        {decode(text)}
      </Text>
    );
  };

  let m;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(src)) !== null) {
    push(src.slice(cursor, m.index));
    cursor = m.index + m[0].length;
    const closing = m[1] === '/';
    const tag = m[2].toLowerCase();
    if (tag === 'br') {
      out.push(<Text key={key++}>{'\n'}</Text>);
      continue;
    }
    if (closing) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag === tag) {
          stack.splice(i, 1);
          break;
        }
      }
    } else {
      const frame = { tag };
      if (tag === 'b' || tag === 'strong') frame.bold = true;
      if (tag === 'i' || tag === 'em') frame.italic = true;
      if (tag === 'u') frame.underline = true;
      if (tag === 'font') {
        const c = /color\s*=\s*"?'?(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)/.exec(m[3] || '');
        if (c) frame.color = c[1];
      }
      stack.push(frame);
    }
  }
  push(src.slice(cursor));

  return (
    <Text style={style} {...rest}>
      {out}
    </Text>
  );
}
