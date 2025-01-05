// app/pages/_document.tsx or in the 'src/pages/_document.tsx' folder
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="monetag" content="9dd22988c9ea6a2e288249357e753eb9" />
        <script
          dangerouslySetInnerHTML={{
            __html: "(function(d,z,s){s.src='https://'+d+'/400/'+z;try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('vemtoutcheeg.com',8747863,document.createElement('script'))",
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
        <script
          dangerouslySetInnerHTML={{
            __html: "(function(d,z,s){s.src='https://'+d+'/400/'+z;try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('vemtoutcheeg.com',8747863,document.createElement('script'))",
          }}
        />
      </body>
    </Html>
  );
}
