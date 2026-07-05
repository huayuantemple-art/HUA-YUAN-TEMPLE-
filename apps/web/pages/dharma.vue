<template>
  <div>
    <div
      style="
        padding: 60px 56px 50px;
        background: linear-gradient(180deg, #4a2a22, #3a211c);
        color: #f7efd9;
        text-align: center;
      "
    >
      <NuxtLink
        to="/primer"
        style="
          font-size: 13px;
          color: #c9a24b;
          text-decoration: none;
          letter-spacing: 0.1em;
          cursor: pointer;
        "
        >← 返回入門佛法</NuxtLink
      >
      <h1
        style="
          font-family: 'Noto Serif TC', serif;
          font-weight: 500;
          font-size: 42px;
          margin: 18px 0 10px;
          letter-spacing: 0.16em;
        "
      >
        入佛門法要
      </h1>
      <p style="font-size: 14px; color: #c9a24b; margin: 0; letter-spacing: 0.2em">
        初入佛門綱要 · 護持正法
      </p>
    </div>
    <div class="sutra-nav">
      <div class="sutra-nav-inner">
        <a href="#d-intro" class="active">序經</a>
        <a href="#d-sanjie">三皈依</a>
        <a href="#d-wujie">五戒</a>
        <a href="#d-sanxue">三學</a>
      </div>
    </div>
    <div style="max-width: 860px; margin: 0 auto; padding: 60px 40px 80px">
      <div id="d-intro" class="sutra-quote">
        <div
          style="
            font-family: 'Noto Serif TC', serif;
            font-size: 12px;
            color: #b8893a;
            letter-spacing: 0.4em;
            margin-bottom: 20px;
            text-align: center;
          "
        >
          序 · 經文
        </div>
        <div
          style="
            font-size: 13px;
            color: #b8893a;
            letter-spacing: 0.2em;
            margin-bottom: 14px;
            text-align: center;
          "
        >
          《佛說三歸五戒慈心厭離功德經》
        </div>
        <p
          style="
            font-family: 'Noto Serif TC', serif;
            font-size: 17px;
            line-height: 2.6;
            color: #2a1a16;
            margin: 0;
            letter-spacing: 0.04em;
            text-align: justify;
          "
        >
          如上施福，不如受三自歸。受三歸者，施一切眾生無畏。是故歸佛、法、僧，其福不可計量也。如上布施及受三歸福，復不如受五戒福。受五戒者，功德滿具，其福勝也。
        </p>
      </div>
      <div id="d-sanjie" class="sutra-section">
        <div class="sutra-section-head">
          <div class="sutra-icon">皈</div>
          <h2
            style="
              font-family: 'Noto Serif TC', serif;
              font-size: 28px;
              color: #3a211c;
              margin: 0;
              letter-spacing: 0.16em;
            "
          >
            三皈依
          </h2>
        </div>
        <div class="sutra-card">
          <div class="sutra-subtitle">一、釋名</div>
          <p class="sutra-text">
            ㈠ 皈者歸投，依者依靠。<br />㈡ 皈依者係皈依三寶。三寶者佛、法、僧也。
          </p>
          <div class="sutra-divider"></div>
          <div class="sutra-subtitle">二、稱「寶」六義</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 22px">
            <div
              style="
                padding: 10px 14px;
                background: rgba(201, 162, 75, 0.05);
                border: 1px solid rgba(201, 162, 75, 0.2);
              "
            >
              <div
                style="
                  font-family: 'Noto Serif TC', serif;
                  font-size: 14px;
                  color: #3a211c;
                  margin-bottom: 3px;
                "
              >
                ① 希有曰寶
              </div>
              <div style="font-size: 12px; color: #8a6f55; line-height: 1.8">
                世寶貧窮所無，三寶薄福不遇。
              </div>
            </div>
            <div
              style="
                padding: 10px 14px;
                background: rgba(201, 162, 75, 0.05);
                border: 1px solid rgba(201, 162, 75, 0.2);
              "
            >
              <div
                style="
                  font-family: 'Noto Serif TC', serif;
                  font-size: 14px;
                  color: #3a211c;
                  margin-bottom: 3px;
                "
              >
                ② 離垢曰寶
              </div>
              <div style="font-size: 12px; color: #8a6f55; line-height: 1.8">
                世寶體無瑕穢，三寶絕離諸漏。
              </div>
            </div>
            <div
              style="
                padding: 10px 14px;
                background: rgba(201, 162, 75, 0.05);
                border: 1px solid rgba(201, 162, 75, 0.2);
              "
            >
              <div
                style="
                  font-family: 'Noto Serif TC', serif;
                  font-size: 14px;
                  color: #3a211c;
                  margin-bottom: 3px;
                "
              >
                ③ 勢力曰寶
              </div>
              <div style="font-size: 12px; color: #8a6f55; line-height: 1.8">
                世寶除貧去毒，三寶六通難思。
              </div>
            </div>
            <div
              style="
                padding: 10px 14px;
                background: rgba(201, 162, 75, 0.05);
                border: 1px solid rgba(201, 162, 75, 0.2);
              "
            >
              <div
                style="
                  font-family: 'Noto Serif TC', serif;
                  font-size: 14px;
                  color: #3a211c;
                  margin-bottom: 3px;
                "
              >
                ④ 莊嚴曰寶
              </div>
              <div style="font-size: 12px; color: #8a6f55; line-height: 1.8">
                世寶嚴身令好，三寶能嚴法身。
              </div>
            </div>
            <div
              style="
                padding: 10px 14px;
                background: rgba(201, 162, 75, 0.05);
                border: 1px solid rgba(201, 162, 75, 0.2);
              "
            >
              <div
                style="
                  font-family: 'Noto Serif TC', serif;
                  font-size: 14px;
                  color: #3a211c;
                  margin-bottom: 3px;
                "
              >
                ⑤ 最勝曰寶
              </div>
              <div style="font-size: 12px; color: #8a6f55; line-height: 1.8">
                世寶諸物中勝，三寶諸有無上。
              </div>
            </div>
            <div
              style="
                padding: 10px 14px;
                background: rgba(201, 162, 75, 0.05);
                border: 1px solid rgba(201, 162, 75, 0.2);
              "
            >
              <div
                style="
                  font-family: 'Noto Serif TC', serif;
                  font-size: 14px;
                  color: #3a211c;
                  margin-bottom: 3px;
                "
              >
                ⑥ 不改曰寶
              </div>
              <div style="font-size: 12px; color: #8a6f55; line-height: 1.8">
                世寶鍊磨不變，三寶八法不動。
              </div>
            </div>
          </div>
          <div class="sutra-divider"></div>
          <div class="sutra-subtitle">三、三寶義</div>
          <div class="sutra-item">
            <div class="sutra-item-title">㈠ 佛義</div>
            <p class="sutra-item-desc">
              佛名覺者，覺有三：自覺、覺他、覺滿。無師大智及無學地一切功德是名佛寶。
            </p>
          </div>
          <div class="sutra-item">
            <div class="sutra-item-title">㈡ 法義</div>
            <p class="sutra-item-desc">軌則名法，能生物解。滅諦無為是名法寶。</p>
          </div>
          <div class="sutra-item" style="margin-bottom: 22px">
            <div class="sutra-item-title">㈢ 僧義</div>
            <p class="sutra-item-desc">聲聞學、無學功德智慧，是名僧寶。</p>
          </div>
          <div class="sutra-box">皈依三寶後，應常念佛、念法、念僧，求生極樂世界。</div>
        </div>
      </div>
      <div id="d-wujie" class="sutra-section">
        <div class="sutra-section-head">
          <div class="sutra-icon">戒</div>
          <h2
            style="
              font-family: 'Noto Serif TC', serif;
              font-size: 28px;
              color: #3a211c;
              margin: 0;
              letter-spacing: 0.16em;
            "
          >
            五戒
          </h2>
        </div>
        <div class="sutra-card">
          <div class="sutra-subtitle">一、釋名</div>
          <p class="sutra-text">
            五戒者，所謂不殺、不盜、不邪婬、不妄語、不飲酒是。此五能防故名為戒。
          </p>
          <div class="sutra-divider"></div>
          <div class="sutra-subtitle">二、分別解說</div>
          <div class="sutra-item">
            <div class="sutra-item-title">㈠ 不殺生</div>
            <p class="sutra-item-desc">慈悲護生，不斷有情命。</p>
          </div>
          <div class="sutra-item">
            <div class="sutra-item-title">㈡ 不盜</div>
            <p class="sutra-item-desc">非理損者為盜。下至草葉不盜。</p>
          </div>
          <div class="sutra-item">
            <div class="sutra-item-title">㈢ 不邪婬</div>
            <p class="sutra-item-desc">護持清淨梵行。</p>
          </div>
          <div class="sutra-item">
            <div class="sutra-item-title">㈣ 不妄語</div>
            <p class="sutra-item-desc">口四過皆須遠離：妄語、惡口、兩舌、綺語。</p>
          </div>
          <div class="sutra-item" style="margin-bottom: 22px">
            <div class="sutra-item-title">㈤ 不飲酒</div>
            <p class="sutra-item-desc">酒能亂性，失諸善法。</p>
          </div>
          <div class="sutra-box">受五戒者，以此善根，迴向願求生於西方極樂世界。</div>
        </div>
      </div>
      <div id="d-sanxue" class="sutra-section">
        <div class="sutra-section-head">
          <div class="sutra-icon">學</div>
          <h2
            style="
              font-family: 'Noto Serif TC', serif;
              font-size: 28px;
              color: #3a211c;
              margin: 0;
              letter-spacing: 0.16em;
            "
          >
            三學
          </h2>
        </div>
        <div class="sutra-card">
          <div class="sutra-subtitle">一、釋名與次第</div>
          <p class="sutra-text">
            三學：增戒學、增定學、增慧學。聖教雖多，不越三學。<br /><strong
              >戒如捉賊，定縛，慧殺。</strong
            >
          </p>
          <div class="sutra-divider"></div>
          <div class="sutra-subtitle">二、分別解說</div>
          <div class="sutra-item">
            <div class="sutra-item-title">戒學　防非止惡</div>
            <p class="sutra-item-desc">「五分功德，以戒為初；無上菩提，以戒為本。」</p>
          </div>
          <div class="sutra-item">
            <div class="sutra-item-title">定學　澄心靜慮</div>
            <p class="sutra-item-desc">四禪次第修習，澄澈心源。</p>
          </div>
          <div class="sutra-item">
            <div class="sutra-item-title">慧學　照破無明</div>
            <p class="sutra-item-desc">依定發慧，如實了知諸法實相。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
