(() => {
  "use strict";

  const program = (name, target, count, summary, tags) => ({
    name,
    target,
    summary,
    tags,
    tasks: Array.from({ length: count }, (_, index) => `${target}__${String(index).padStart(3, "0")}`)
  });

  window.SWE_TEST_CORPUS = [
    {
      slug: "language-runtime",
      name: "Language Runtime",
      summary: "Branch inversion across PHP parsing, execution, and JIT compilation paths where structured source text drives deep runtime state.",
      tags: ["PHP", "parser", "JIT"],
      programs: [
        program("PHP Parser", "php_php_fuzz_parser", 7, "Exercises tokenization and parser control flow using syntactically constrained PHP inputs.", ["PHP", "parser"]),
        program("PHP Executor", "php_php_fuzz_execute", 2, "Targets branches reached while compiling and executing generated PHP programs.", ["PHP", "runtime"]),
        program("PHP Function JIT", "php_php_fuzz_function_jit", 1, "Tests JIT-specific paths that depend on function structure and runtime type state.", ["PHP", "JIT"])
      ]
    },
    {
      slug: "sql-parser",
      name: "SQL Parser",
      summary: "SQL grammar tasks that require agents to construct queries reaching specific parser states and semantic branches.",
      tags: ["SQL", "grammar", "parser"],
      programs: [
        program("SQL Parser", "sql_parser_fuzz_sql_parse", 11, "Builds valid or deliberately edge-case SQL statements to reach hidden parsing conditions.", ["SQL", "parser"])
      ]
    },
    {
      slug: "xml-markup",
      name: "XML / Markup",
      summary: "Structured XML inputs for navigating libxml2 tokenization, entity handling, validation, and tree-building logic.",
      tags: ["XML", "libxml2", "markup"],
      programs: [
        program("libxml2", "libxml2_xml", 9, "Targets branches in the primary libxml2 XML fuzzing harness.", ["XML", "parser"]),
        program("libxml2 pinned revision", "libxml2_xml_e85b9b", 1, "A revision-specific target preserving a distinct parser behavior.", ["XML", "revision"])
      ]
    },
    {
      slug: "font-shaping",
      name: "Font / Shaping",
      summary: "Font files and text-shaping state drive complex layout, script-specific reordering, and memory-management paths.",
      tags: ["HarfBuzz", "FreeType", "fonts"],
      programs: [
        program("HarfBuzz Shape", "harfbuzz_hb_shape_fuzzer", 9, "Exercises shaping logic across buffers, scripts, and OpenType-specific transformations.", ["HarfBuzz", "shaping"]),
        program("HarfBuzz pinned revision", "harfbuzz_hb_shape_fuzzer_17863b", 1, "A revision-specific shaping target with distinct branch behavior.", ["HarfBuzz", "revision"]),
        program("FreeType", "freetype2_ftfuzzer", 1, "Uses font binaries to reach allocation and glyph-processing conditions.", ["FreeType", "font"])
      ]
    },
    {
      slug: "networking-iot",
      name: "Networking / IoT",
      summary: "Protocol and packet-processing targets spanning IPv6, HTTP, and DTLS state machines.",
      tags: ["OpenThread", "cURL", "mbedTLS"],
      programs: [
        program("OpenThread", "openthread_ot_ip6_send_fuzzer", 5, "Constructs IPv6 packet state for branches in OpenThread networking logic.", ["IPv6", "IoT"]),
        program("cURL HTTP", "curl_curl_fuzzer_http", 1, "Targets HTTP formatting and transfer-related code paths.", ["HTTP", "cURL"]),
        program("mbedTLS DTLS", "mbedtls_fuzz_dtlsclient", 1, "Exercises DTLS client parsing and protocol-state transitions.", ["DTLS", "TLS"])
      ]
    },
    {
      slug: "url-parsing",
      name: "URL Parsing",
      summary: "WHATWG-style URL inputs that exercise scheme recognition, component parsing, and normalization.",
      tags: ["Ada URL", "WHATWG", "parser"],
      programs: [
        program("Ada URL — can parse", "ada_url_can_parse", 1, "Targets the fast URL validity and scheme-recognition path.", ["URL", "validation"]),
        program("Ada URL — parse", "ada_url_parse", 1, "Targets component aggregation and full URL parsing behavior.", ["URL", "parser"])
      ]
    },
    {
      slug: "binary-analysis",
      name: "Binary Analysis",
      summary: "Binary-format tasks where agents must construct object data that reaches deep symbol and section analysis paths.",
      tags: ["Bloaty", "Mach-O", "WebAssembly"],
      programs: [
        program("Bloaty", "bloaty_fuzz_target", 2, "Covers symbol parsing paths for binary formats including Mach-O and WebAssembly.", ["binary", "symbols"])
      ]
    },
    {
      slug: "geospatial",
      name: "Geospatial",
      summary: "Coordinate-reference-system inputs for exercising parsing and transformation logic in PROJ.",
      tags: ["PROJ", "CRS", "geospatial"],
      programs: [
        program("PROJ CRS Transformer", "proj4_proj_crs_to_crs_fuzzer", 2, "Constructs CRS definitions and transformations that reach specific geospatial branches.", ["PROJ", "CRS"])
      ]
    },
    {
      slug: "smart-contracts",
      name: "Smart Contracts",
      summary: "Structured Solidity compiler inputs targeting semantic analysis and compilation control flow.",
      tags: ["Solidity", "compiler", "protobuf"],
      programs: [
        program("Solidity Compiler", "solidity_solc_ossfuzz_proto", 1, "Uses structured compiler input to reach Solidity analysis and code-generation branches.", ["Solidity", "compiler"])
      ]
    },
    {
      slug: "cryptography",
      name: "Cryptography",
      summary: "DER-encoded certificate inputs targeting X.509 parsing and validation behavior in OpenSSL.",
      tags: ["OpenSSL", "X.509", "DER"],
      programs: [
        program("OpenSSL X.509", "openssl_x509", 1, "Constructs certificate data for deep ASN.1 and X.509 parser conditions.", ["OpenSSL", "X.509"])
      ]
    },
    {
      slug: "javascript-engine",
      name: "JavaScript Engine",
      summary: "Regular-expression inputs for reaching parser and execution branches in QuickJS.",
      tags: ["QuickJS", "RegExp", "JavaScript"],
      programs: [
        program("QuickJS RegExp", "quickjs_fuzz_regexp", 1, "Targets regular-expression compilation and matching behavior.", ["QuickJS", "RegExp"])
      ]
    },
    {
      slug: "audio-codec",
      name: "Audio Codec",
      summary: "Encoded audio data for exercising container parsing and decode paths in Vorbis.",
      tags: ["Vorbis", "audio", "decoder"],
      programs: [
        program("Vorbis Decoder", "vorbis_decode_fuzzer", 1, "Constructs encoded audio inputs that navigate decoder state and validation.", ["Vorbis", "codec"])
      ]
    },
    {
      slug: "json-processor",
      name: "JSON Processor",
      summary: "JSON documents and jq programs targeting parsing, filtering, and execution paths.",
      tags: ["jq", "JSON", "filters"],
      programs: [
        program("jq", "jq_jq_fuzz_execute", 1, "Combines JSON values and jq filters to reach interpreter branches.", ["jq", "JSON"])
      ]
    }
  ];
})();
