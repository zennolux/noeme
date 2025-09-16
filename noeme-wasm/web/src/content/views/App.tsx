import { useEffect, useState } from "react";
import parse from "html-react-parser";
import { type Noeme } from "../../../wasm";
import {
  AttrTag,
  AudioPlayer,
  Container,
  Content,
  Footer,
  Header,
  Paragraph,
  Title,
} from "@/components/noeme";

function App() {
  const [open, setOpen] = useState<boolean | undefined>();
  const [noeme, setNoeme] = useState<Noeme | undefined>();
  const [audioPlaying, setAudioPlaying] = useState<{
    [prop: string]: boolean;
  }>();

  useEffect(() => {
    if (!chrome.runtime?.id) {
      return;
    }

    document.addEventListener("dblclick", () => {
      const word = window.getSelection()?.toString().trim();

      if (!word || word?.length < 1) {
        return;
      }

      if (!/^[a-zA-Z]{2,}$/.test(word)) {
        return;
      }

      chrome.runtime.sendMessage(
        { type: "FETCH_EXPLAINED_DATA", target: "background", data: { word } },
        (response: Noeme | undefined) => {
          if (!response) {
            return;
          }

          setNoeme(response);
        }
      );
    });

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      const { target, type, data } = message;

      if (
        target != "contentscript" ||
        type != "AUDIO_COMPLETED_TO_PLAY" ||
        !data.ended
      ) {
        return;
      }

      setAudioPlaying({ [data.url]: false });
      sendResponse(true);

      return true;
    });
  }, []);

  useEffect(() => noeme && setOpen(true), [noeme]);

  return (
    <Container open={open} setOpen={setOpen}>
      <Header>
        <Title size="large">{noeme?.word}</Title>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--item-space)",
          }}
        >
          <Paragraph>[{noeme?.pronunciation.phonetic_symbol}]</Paragraph>
          <AudioPlayer
            url={noeme?.pronunciation.audio_url!}
            onPlay={(url: string) => {
              setAudioPlaying({ [url]: true });
            }}
            isPlaying={
              audioPlaying && audioPlaying[noeme?.pronunciation.audio_url!]
            }
          />
        </div>
      </Header>
      <Content>
        {noeme?.basic_meanings.length! > 0 && (
          <div style={{ padding: "0 var(--item-space) 0 var(--item-space)" }}>
            <Title>Basic Meanings:</Title>
            {noeme?.basic_meanings.map((item, index) => (
              <div
                key={index}
                style={{
                  marginTop: "var(--item-space)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--item-space)",
                }}
              >
                <AttrTag value={item.attr} />
                <Paragraph>{item.value}</Paragraph>
              </div>
            ))}
          </div>
        )}
        {noeme?.advanced_meanings.length! > 0 && (
          <div
            style={{
              padding: "0 var(--item-space) 0 var(--item-space)",
            }}
          >
            <Title>Advanced Meanings:</Title>
            {noeme?.advanced_meanings.map((item, key) => (
              <div
                key={key}
                style={{
                  marginTop: "var(--item-space)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--item-space)",
                }}
              >
                <AttrTag value={item.attr} />
                {item.values.map((value, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "start",
                      gap: "var(--item-space)",
                    }}
                  >
                    <Paragraph style={{ fontWeight: "bold", width: "auto" }}>
                      {index + 1}.
                    </Paragraph>
                    <div style={{ flex: 1 }}>
                      <Paragraph>{value.en}</Paragraph>
                      <Paragraph
                        style={{ marginTop: "calc(var(--item-space) / 2)" }}
                      >
                        {value.cn}
                      </Paragraph>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {noeme?.sentences.length! > 0 && (
          <div>
            <Title style={{ paddingLeft: "var(--item-space)" }}>
              Sample Sentences:
            </Title>
            {noeme?.sentences.map((item, index) => (
              <div
                key={index}
                style={{
                  marginTop: "var(--item-space)",
                  padding: "0 var(--item-space) 0 var(--item-space)",
                  display: "flex",
                  alignItems: "start",
                  gap: "var(--item-space)",
                  ...(audioPlaying && audioPlaying[item.audio_url]
                    ? { backgroundColor: "var(--highlight-bg)", opacity: 0.7 }
                    : {}),
                }}
              >
                <div
                  style={{
                    width: "auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "calc(var(--item-space) / 3)",
                  }}
                >
                  <Paragraph style={{ fontWeight: "bold" }}>
                    {index + 1}.
                  </Paragraph>
                  <p>
                    <AudioPlayer
                      url={item.audio_url}
                      onPlay={(url: string) => setAudioPlaying({ [url]: true })}
                      isPlaying={audioPlaying && audioPlaying[item.audio_url]}
                    />
                  </p>
                </div>
                <div
                  style={{
                    flex: 1,
                    color:
                      audioPlaying && audioPlaying[item.audio_url]
                        ? "var(--highlight-text)"
                        : "",
                  }}
                >
                  <Paragraph>
                    {parse(
                      item.en.replace(
                        new RegExp(`(${noeme.word})`, "gi"),
                        `<span className="tw:font-bold tw:underline tw:underline-offset-8">$1</span>`
                      )
                    )}
                  </Paragraph>
                  <Paragraph
                    style={{ marginTop: "calc(var(--item-space) / 2)" }}
                  >
                    {item.cn}
                  </Paragraph>
                </div>
              </div>
            ))}
          </div>
        )}
      </Content>
      <Footer />
    </Container>
  );
}

export default App;
