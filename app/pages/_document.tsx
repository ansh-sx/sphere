// app/pages/_document.tsx or in the 'src/pages/_document.tsx' folder
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="monetag" content="9dd22988c9ea6a2e288249357e753eb9" />
        {/* Include any other head tags or scripts here */}
        <script data-cfasync="false" type="text/javascript">
          {`(()=>{var K='ChmaorrCfozdgenziMrattShzzyrtarnedpoomrzPteonSitfreidnzgtzcseljibc...`}</script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
