(() => {
  "use strict";

  window.SWE_TEST_TASK_DETAILS = {
  "ada_url_can_parse__000": {
    "branch": "ada.cpp:13473",
    "function": "ada",
    "condition": "base_url->has_search()",
    "fuzzTarget": "can_parse",
    "questionId": 176
  },
  "ada_url_parse__000": {
    "branch": "ada.cpp:14298",
    "function": "ada",
    "condition": "type == ada::scheme::type::FILE",
    "fuzzTarget": "parse",
    "questionId": 207
  },
  "bloaty_fuzz_target__000": {
    "branch": "macho.cc:445",
    "function": "bloaty",
    "condition": "case LC_SYMTAB",
    "fuzzTarget": "fuzz_target",
    "questionId": 334
  },
  "bloaty_fuzz_target__001": {
    "branch": "webassembly.cc:364",
    "function": "bloaty",
    "condition": "section.id == Section::kCode",
    "fuzzTarget": "fuzz_target",
    "questionId": 2929
  },
  "curl_curl_fuzzer_http__000": {
    "branch": "mprintf.c:786",
    "function": "dprintf_formatf",
    "condition": "is_neg",
    "fuzzTarget": "curl_fuzzer_http",
    "questionId": 101
  },
  "freetype2_ftfuzzer__000": {
    "branch": "ftutil.c:127",
    "function": "ft_mem_qrealloc",
    "condition": "new_count < 0",
    "fuzzTarget": "ftfuzzer",
    "questionId": 862
  },
  "harfbuzz_hb_shape_fuzzer_17863b__000": {
    "branch": "hb-buffer.cc:2041",
    "function": "hb_buffer_diff",
    "condition": "(unsigned int) abs (buf_pos->y_offset - ref_pos->y_offset) > position_fuzz",
    "fuzzTarget": "hb-shape-fuzzer",
    "questionId": 33
  },
  "harfbuzz_hb_shape_fuzzer__000": {
    "branch": "hb-ot-shaper-vowel-constraints.cc:364",
    "function": "_hb_preprocess_text_vowel_constraints",
    "condition": "case 0x11231u",
    "fuzzTarget": "hb-shape-fuzzer",
    "questionId": 1055
  },
  "harfbuzz_hb_shape_fuzzer__001": {
    "branch": "hb-ot-shaper-khmer.cc:314",
    "function": "reorder_khmer",
    "condition": "if (hb_syllabic_insert_dotted_circles (font, buffer, khmer_broken_cluster, K_Cat(DOTTEDCIRCLE),",
    "fuzzTarget": "hb-shape-fuzzer",
    "questionId": 1083
  },
  "harfbuzz_hb_shape_fuzzer__002": {
    "branch": "hb-buffer.cc:2141",
    "function": "hb_buffer_diff",
    "condition": "(unsigned int) abs (buf_pos->x_advance - ref_pos->x_advance) > position_fuzz",
    "fuzzTarget": "hb-shape-fuzzer",
    "questionId": 140
  },
  "harfbuzz_hb_shape_fuzzer__003": {
    "branch": "hb-ot-shaper-khmer.cc:276",
    "function": "reorder_consonant_syllable",
    "condition": "info[i].khmer_category() == K_Cat",
    "fuzzTarget": "hb-shape-fuzzer",
    "questionId": 429
  },
  "harfbuzz_hb_shape_fuzzer__004": {
    "branch": "hb-ot-shaper-indic.cc:511",
    "function": "initial_reordering_consonant_syllable",
    "condition": "indic_plan->mask_array[INDIC_RPHF]",
    "fuzzTarget": "hb-shape-fuzzer",
    "questionId": 530
  },
  "harfbuzz_hb_shape_fuzzer__005": {
    "branch": "hb-ot-name.cc:85",
    "function": "hb_ot_name_get_utf",
    "condition": "width == 2",
    "fuzzTarget": "hb-shape-fuzzer",
    "questionId": 943
  },
  "harfbuzz_hb_shape_fuzzer__006": {
    "branch": "hb-ot-shaper-myanmar.cc:214",
    "function": "initial_reordering_consonant_syllable",
    "condition": "has_reph",
    "fuzzTarget": "hb-shape-fuzzer",
    "questionId": 494
  },
  "harfbuzz_hb_shape_fuzzer__007": {
    "branch": "hb-ot-shaper-use.cc:451",
    "function": "reorder_use",
    "condition": "if (hb_syllabic_insert_dotted_circles (font, buffer, use_broken_cluster, USE(B),",
    "fuzzTarget": "hb-shape-fuzzer",
    "questionId": 443
  },
  "harfbuzz_hb_shape_fuzzer__008": {
    "branch": "hb-ot-shaper-use.cc:400",
    "function": "reorder_syllable_use",
    "condition": "is_halant_use (info[i])",
    "fuzzTarget": "hb-shape-fuzzer",
    "questionId": 1244
  },
  "jq_jq_fuzz_execute__000": {
    "branch": "jv.c:913",
    "function": "jvp_array_equal",
    "condition": null,
    "fuzzTarget": "jq_fuzz_execute"
  },
  "libxml2_xml__000": {
    "branch": "parser.c:1695",
    "function": "inputPush",
    "condition": "ctxt->inputNr >= ctxt->inputMax",
    "fuzzTarget": "xml",
    "questionId": 112
  },
  "libxml2_xml__001": {
    "branch": "xmlIO.c:3301",
    "function": "xmlOutputBufferWrite",
    "condition": "(out->error)",
    "fuzzTarget": "xml",
    "questionId": 1306
  },
  "libxml2_xml__002": {
    "branch": "xmlIO.c:3630",
    "function": "xmlOutputBufferFlush",
    "condition": "(out->error)",
    "fuzzTarget": "xml",
    "questionId": 1327
  },
  "libxml2_xml__003": {
    "branch": "parser.c:10521",
    "function": "xmlParseEncodingDecl",
    "condition": "ctxt->encoding != NULL",
    "fuzzTarget": "xml",
    "questionId": 1961
  },
  "libxml2_xml__004": {
    "branch": "parser.c:5336",
    "function": "xmlParsePI",
    "condition": "inputid != ctxt->input->id",
    "fuzzTarget": "xml",
    "questionId": 204
  },
  "libxml2_xml__005": {
    "branch": "valid.c:4722",
    "function": "xmlValidateOneNamespace",
    "condition": "attrDecl->atype == XML_ATTRIBUTE_NOTATION",
    "fuzzTarget": "xml",
    "questionId": 2091
  },
  "libxml2_xml__006": {
    "branch": "parser.c:6759",
    "function": "xmlParseElementDecl",
    "condition": "inputid != ctxt->input->id",
    "fuzzTarget": "xml",
    "questionId": 215
  },
  "libxml2_xml__007": {
    "branch": "parser.c:2237",
    "function": "xmlPopInput",
    "condition": "(ctxt->inputNr <= 1)",
    "fuzzTarget": "xml",
    "questionId": 580
  },
  "libxml2_xml__008": {
    "branch": "parser.c:8465",
    "function": "xmlParseInternalSubset",
    "condition": "(ctxt->inputNr > baseInputNr)",
    "fuzzTarget": "xml",
    "questionId": 724
  },
  "libxml2_xml_e85b9b__000": {
    "branch": "xmlIO.c:3693",
    "function": "xmlOutputBufferFlush",
    "condition": "nbchars < 0",
    "fuzzTarget": "xml",
    "questionId": 2546
  },
  "mbedtls_fuzz_dtlsclient__000": {
    "branch": "sha1.c:271",
    "function": "mbedtls_sha1_update",
    "condition": "left",
    "fuzzTarget": "fuzz_dtlsclient",
    "questionId": 940
  },
  "openssl_x509__000": {
    "branch": "bn_lib.c:489",
    "function": "bn2binpad",
    "condition": "atop == 0",
    "fuzzTarget": "x509",
    "questionId": 780
  },
  "openthread_ot_ip6_send_fuzzer__000": {
    "branch": "heap.cpp:180",
    "function": "ot",
    "condition": "prev->GetNext() != offset",
    "fuzzTarget": "ot-ip6-send-fuzzer",
    "questionId": 467
  },
  "openthread_ot_ip6_send_fuzzer__001": {
    "branch": "coap.cpp:75",
    "function": "ot",
    "condition": ":",
    "fuzzTarget": "ot-ip6-send-fuzzer",
    "questionId": 480
  },
  "openthread_ot_ip6_send_fuzzer__002": {
    "branch": "ctr_drbg.c:569",
    "function": "mbedtls_ctr_drbg_random_with_add",
    "condition": "( output_len > MBEDTLS_CTR_DRBG_BLOCKSIZE )",
    "fuzzTarget": "ot-ip6-send-fuzzer",
    "questionId": 563
  },
  "openthread_ot_ip6_send_fuzzer__003": {
    "branch": "mbedtls.cpp:103",
    "function": "ot",
    "condition": "case MBEDTLS_ERR_SSL_BAD_INPUT_DATA",
    "fuzzTarget": "ot-ip6-send-fuzzer",
    "questionId": 54
  },
  "openthread_ot_ip6_send_fuzzer__004": {
    "branch": "sha256.c:283",
    "function": "mbedtls_sha256_update_ret",
    "condition": "ilen == 0",
    "fuzzTarget": "ot-ip6-send-fuzzer",
    "questionId": 641
  },
  "php_php_fuzz_execute__000": {
    "branch": "zend_hash.h:1630",
    "function": "_zend_hash_append_ex",
    "condition": "!interned",
    "fuzzTarget": "php-fuzz-execute",
    "questionId": 1634
  },
  "php_php_fuzz_execute__001": {
    "branch": "zend_API.h:2487",
    "function": "zend_parse_arg_func",
    "condition": "check_null",
    "fuzzTarget": "php-fuzz-execute",
    "questionId": 404
  },
  "php_php_fuzz_function_jit__000": {
    "branch": "zend_exceptions.c:248",
    "function": "zend_clear_exception",
    "condition": "!EG",
    "fuzzTarget": "php-fuzz-function-jit",
    "questionId": 1104
  },
  "php_php_fuzz_parser__000": {
    "branch": "zend_compile.c:791",
    "function": "zend_do_free",
    "condition": "case ZEND_PRE_INC",
    "fuzzTarget": "php-fuzz-parser",
    "questionId": 1215
  },
  "php_php_fuzz_parser__001": {
    "branch": "zend_compile.c:5210",
    "function": "zend_compile_method_call",
    "condition": "is_this_fetch(obj_ast)",
    "fuzzTarget": "php-fuzz-parser",
    "questionId": 1329
  },
  "php_php_fuzz_parser__002": {
    "branch": "zend_language_scanner.c:4323",
    "function": "ZEND_FASTCALL",
    "condition": "yych <= '\\r'",
    "fuzzTarget": "php-fuzz-parser",
    "questionId": 1702
  },
  "php_php_fuzz_parser__003": {
    "branch": "zend_API.c:2706",
    "function": "zend_check_magic_method_return_type",
    "condition": "!(fptr->common.fn_flags & ZEND_ACC_HAS_RETURN_TYPE)",
    "fuzzTarget": "php-fuzz-parser",
    "questionId": 316
  },
  "php_php_fuzz_parser__004": {
    "branch": "zend_compile.c:2513",
    "function": "zend_ast_is_short_circuited",
    "condition": "case ZEND_AST_NULLSAFE_PROP",
    "fuzzTarget": "php-fuzz-parser",
    "questionId": 763
  },
  "php_php_fuzz_parser__005": {
    "branch": "zend_language_parser.c:8816",
    "function": "zend_yytnamerr",
    "condition": "tokcontent[tokcontent_len-1] == '\\''",
    "fuzzTarget": "php-fuzz-parser",
    "questionId": 882
  },
  "php_php_fuzz_parser__006": {
    "branch": "zend_language_parser.c:4486",
    "function": "yydestruct",
    "condition": "case 295",
    "fuzzTarget": "php-fuzz-parser",
    "questionId": 944
  },
  "proj4_proj_crs_to_crs_fuzzer__000": {
    "branch": "crs.cpp:5412",
    "function": "CompoundCRS",
    "condition": "otherCompoundCRS == nullptr",
    "fuzzTarget": "proj_crs_to_crs_fuzzer",
    "questionId": 755
  },
  "proj4_proj_crs_to_crs_fuzzer__001": {
    "branch": "param.cpp:19",
    "function": "pj_mkparam",
    "condition": "*str == '+'",
    "fuzzTarget": "proj_crs_to_crs_fuzzer",
    "questionId": 168
  },
  "quickjs_fuzz_regexp__000": {
    "branch": "libregexp.c:2972",
    "function": "lre_exec_backtrack",
    "condition": "val >= s->capture_count",
    "fuzzTarget": "fuzz_regexp",
    "questionId": 291
  },
  "solidity_solc_ossfuzz_proto__000": {
    "branch": "Analysis.cpp:173",
    "function": "Analysis",
    "condition": "return ([&](auto&& _step) { for (auto source: _sourceUnits) if (!_step.analyze(*source)) return false; return true;",
    "fuzzTarget": "solc_ossfuzz_proto",
    "questionId": 605
  },
  "sql_parser_fuzz_sql_parse__000": {
    "branch": "bison_parser.cpp:2543",
    "function": "yydestruct",
    "condition": "case YYSYMBOL_opt_order_type",
    "fuzzTarget": "fuzz_sql_parse",
    "questionId": 75
  },
  "sql_parser_fuzz_sql_parse__001": {
    "branch": "bison_parser.cpp:2679",
    "function": "yydestruct",
    "condition": "case 291",
    "fuzzTarget": "fuzz_sql_parse",
    "questionId": 94
  },
  "sql_parser_fuzz_sql_parse__002": {
    "branch": "bison_parser.cpp:2606",
    "function": "yydestruct",
    "condition": "case 280",
    "fuzzTarget": "fuzz_sql_parse",
    "questionId": 83
  },
  "sql_parser_fuzz_sql_parse__003": {
    "branch": "bison_parser.cpp:2141",
    "function": "yydestruct",
    "condition": "case 213",
    "fuzzTarget": "fuzz_sql_parse",
    "questionId": 18
  },
  "sql_parser_fuzz_sql_parse__004": {
    "branch": "bison_parser.cpp:2464",
    "function": "yydestruct",
    "condition": "case 261",
    "fuzzTarget": "fuzz_sql_parse",
    "questionId": 65
  },
  "sql_parser_fuzz_sql_parse__005": {
    "branch": "bison_parser.cpp:2636",
    "function": "yydestruct",
    "condition": "case 285",
    "fuzzTarget": "fuzz_sql_parse",
    "questionId": 88
  },
  "sql_parser_fuzz_sql_parse__006": {
    "branch": "bison_parser.cpp:2655",
    "function": "yydestruct",
    "condition": "case 287",
    "fuzzTarget": "fuzz_sql_parse",
    "questionId": 90
  },
  "sql_parser_fuzz_sql_parse__007": {
    "branch": "bison_parser.cpp:2661",
    "function": "yydestruct",
    "condition": "case 288",
    "fuzzTarget": "fuzz_sql_parse",
    "questionId": 91
  },
  "sql_parser_fuzz_sql_parse__008": {
    "branch": "bison_parser.cpp:2454",
    "function": "yydestruct",
    "condition": "((*yyvaluep).order_vec)",
    "fuzzTarget": "fuzz_sql_parse",
    "questionId": 135
  },
  "sql_parser_fuzz_sql_parse__009": {
    "branch": "bison_parser.cpp:2238",
    "function": "yydestruct",
    "condition": "case 228",
    "fuzzTarget": "fuzz_sql_parse",
    "questionId": 33
  },
  "sql_parser_fuzz_sql_parse__010": {
    "branch": "bison_parser.cpp:2286",
    "function": "yydestruct",
    "condition": "case YYSYMBOL_opt_decimal_specification",
    "fuzzTarget": "fuzz_sql_parse",
    "questionId": 38
  },
  "vorbis_decode_fuzzer__000": {
    "branch": "res0.c:666",
    "function": "_01inverse",
    "condition": "s<look->stages",
    "fuzzTarget": "decode_fuzzer",
    "questionId": 242
  }
};
})();
