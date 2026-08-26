<?php
/**
 * Plugin Name: McDermott's Content Types
 * Description: Headless content types for the Next.js storefront — Landing Pages, Sofa Models and Mattresses, plus a "belongs to model" link on WooCommerce products. Field groups are registered in code; requires Advanced Custom Fields PRO (flexible content + repeaters). Content is exposed read-only via the WP REST API; the WordPress theme does not render these pages.
 * Version:     1.0.0
 * Author:      Conor Walsh
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* -------------------------------------------------------------------------
 * Post types
 *
 * public => false keeps these out of the theme's front-end routing and
 * search on mcdermotts.ie; show_in_rest => true is what the storefront
 * reads. Published posts of a show_in_rest type are readable without
 * authentication, which is exactly the contract the Next.js site expects
 * (same as the open Store API).
 * ---------------------------------------------------------------------- */

add_action( 'init', 'mcd_register_content_types' );
function mcd_register_content_types() {
	$shared = array(
		'public'              => false,
		'show_ui'             => true,
		'show_in_menu'        => true,
		'show_in_rest'        => true,
		'has_archive'         => false,
		'rewrite'             => false,
		'exclude_from_search' => true,
		'supports'            => array( 'title', 'revisions' ),
		'menu_position'       => 21,
	);

	register_post_type( 'mcd_landing', array_merge( $shared, array(
		'labels'    => mcd_cpt_labels( 'Landing Page', 'Landing Pages' ),
		'rest_base' => 'landing-pages',
		'menu_icon' => 'dashicons-megaphone',
	) ) );

	register_post_type( 'mcd_sofa_model', array_merge( $shared, array(
		'labels'    => mcd_cpt_labels( 'Sofa Model', 'Sofa Models' ),
		'rest_base' => 'sofa-models',
		'menu_icon' => 'dashicons-align-full-width',
	) ) );

	register_post_type( 'mcd_mattress', array_merge( $shared, array(
		'labels'    => mcd_cpt_labels( 'Mattress Page', 'Mattress Pages' ),
		'rest_base' => 'mattresses',
		'menu_icon' => 'dashicons-image-flip-horizontal',
	) ) );
}

function mcd_cpt_labels( $singular, $plural ) {
	return array(
		'name'          => $plural,
		'singular_name' => $singular,
		'add_new_item'  => "Add New {$singular}",
		'edit_item'     => "Edit {$singular}",
		'search_items'  => "Search {$plural}",
		'not_found'     => "No {$plural} yet.",
	);
}

/* Image / relationship fields return full values (url, alt…) in REST instead
 * of attachment IDs — the storefront mapper depends on this. */
add_filter( 'acf/settings/rest_api_format', function () {
	return 'standard';
} );

/* Surface a clear message rather than silently registering empty types. */
add_action( 'admin_notices', function () {
	if ( function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}
	echo '<div class="notice notice-error"><p><strong>McDermott\'s Content Types:</strong> Advanced Custom Fields PRO is not active — the Landing Page / Sofa Model / Mattress field groups will not appear until it is installed and activated.</p></div>';
} );

/* -------------------------------------------------------------------------
 * Field groups (code-registered; nothing to click together in ACF admin)
 * ---------------------------------------------------------------------- */

add_action( 'acf/init', 'mcd_register_field_groups' );
function mcd_register_field_groups() {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	/* ---- Landing pages (range / campaign) ---- */
	acf_add_local_field_group( array(
		'key'          => 'group_mcd_landing',
		'title'        => 'Landing Page',
		'show_in_rest' => 1,
		'location'     => array( array( array(
			'param'    => 'post_type',
			'operator' => '==',
			'value'    => 'mcd_landing',
		) ) ),
		'fields'       => array_merge(
			mcd_hero_fields( 'landing', 'Introducing…' ),
			array( mcd_blocks_field( 'landing' ) )
		),
	) );

	/* ---- Sofa models ---- */
	acf_add_local_field_group( array(
		'key'          => 'group_mcd_sofa',
		'title'        => 'Sofa Model',
		'show_in_rest' => 1,
		'location'     => array( array( array(
			'param'    => 'post_type',
			'operator' => '==',
			'value'    => 'mcd_sofa_model',
		) ) ),
		'fields'       => array_merge(
			mcd_hero_fields( 'sofa', 'Sofa range' ),
			mcd_brand_fields( 'sofa' ),
			array(
				array(
					'key'          => 'field_mcd_sofa_fabric_note',
					'label'        => 'Fabric / cover options',
					'name'         => 'fabric_note',
					'type'         => 'text',
					'instructions' => 'Shown in the "At a glance" panel, e.g. "Wide fabric selection — full range in Castlebar".',
				),
				array(
					'key'          => 'field_mcd_sofa_configurations',
					'label'        => 'Configurations',
					'name'         => 'configurations',
					'type'         => 'repeater',
					'button_label' => 'Add configuration',
					'sub_fields'   => array( array(
						'key'   => 'field_mcd_sofa_configurations_name',
						'label' => 'Name',
						'name'  => 'name',
						'type'  => 'text',
					) ),
				),
				array(
					'key'          => 'field_mcd_sofa_guarantee',
					'label'        => 'Guarantee',
					'name'         => 'guarantee',
					'type'         => 'text',
					'instructions' => 'e.g. "25 year frame guarantee".',
				),
				mcd_blocks_field( 'sofa' ),
			)
		),
	) );

	/* ---- Mattresses ---- */
	acf_add_local_field_group( array(
		'key'          => 'group_mcd_mattress',
		'title'        => 'Mattress Page',
		'show_in_rest' => 1,
		'location'     => array( array( array(
			'param'    => 'post_type',
			'operator' => '==',
			'value'    => 'mcd_mattress',
		) ) ),
		'fields'       => array_merge(
			mcd_hero_fields( 'mattress', 'Mattress' ),
			mcd_brand_fields( 'mattress' ),
			array(
				array(
					'key'        => 'field_mcd_mattress_firmness',
					'label'      => 'Firmness',
					'name'       => 'firmness',
					'type'       => 'select',
					'choices'    => array(
						'soft'        => 'Soft',
						'medium'      => 'Medium',
						'medium-firm' => 'Medium-firm',
						'firm'        => 'Firm',
					),
					'allow_null' => 1,
				),
				array(
					'key'          => 'field_mcd_mattress_height',
					'label'        => 'Mattress height',
					'name'         => 'mattress_height',
					'type'         => 'text',
					'instructions' => 'e.g. "34 cm".',
				),
				array(
					'key'        => 'field_mcd_mattress_turn_type',
					'label'      => 'Care',
					'name'       => 'turn_type',
					'type'       => 'select',
					'choices'    => array(
						'no-turn'  => 'No-turn',
						'turnable' => 'Turnable',
						'rotate'   => 'Rotate only',
					),
					'allow_null' => 1,
				),
				array(
					'key'     => 'field_mcd_mattress_sizes',
					'label'   => 'Available sizes',
					'name'    => 'sizes',
					'type'    => 'checkbox',
					'choices' => array(
						'single'       => 'Single',
						'small-double' => 'Small Double',
						'double'       => 'Double',
						'king'         => 'King',
						'super-king'   => 'Super King',
					),
				),
				array(
					'key'          => 'field_mcd_mattress_trial',
					'label'        => 'Trial / guarantee',
					'name'         => 'trial',
					'type'         => 'text',
					'instructions' => 'e.g. "90-night comfort trial". Leave blank if it does not apply.',
				),
				mcd_blocks_field( 'mattress' ),
			)
		),
	) );

	/* ---- Product → model link (adds to WooCommerce products) ---- */
	acf_add_local_field_group( array(
		'key'          => 'group_mcd_product_model',
		'title'        => 'Storefront: model link',
		'show_in_rest' => 1,
		'location'     => array( array( array(
			'param'    => 'post_type',
			'operator' => '==',
			'value'    => 'product',
		) ) ),
		'fields'       => array( array(
			'key'           => 'field_mcd_product_belongs_to_model',
			'label'         => 'Belongs to model',
			'name'          => 'belongs_to_model',
			'type'          => 'post_object',
			'post_type'     => array( 'mcd_sofa_model', 'mcd_mattress' ),
			'return_format' => 'id',
			'allow_null'    => 1,
			'instructions'  => 'Link this product to its Sofa Model or Mattress page — the storefront shows the model\'s range content on the product page.',
		) ),
	) );
}

/* Hero fields shared by all three types: eyebrow, standfirst, hero image.
 * Title and slug come from the post itself. */
function mcd_hero_fields( $prefix, $eyebrow_default ) {
	return array(
		array(
			'key'           => "field_mcd_{$prefix}_eyebrow",
			'label'         => 'Eyebrow',
			'name'          => 'eyebrow',
			'type'          => 'text',
			'default_value' => $eyebrow_default,
			'instructions'  => 'Small label above the page title.',
		),
		array(
			'key'          => "field_mcd_{$prefix}_standfirst",
			'label'        => 'Standfirst',
			'name'         => 'standfirst',
			'type'         => 'text',
			'instructions' => 'One-line summary under the title, e.g. "Sink-in comfort, built to last".',
		),
		array(
			'key'           => "field_mcd_{$prefix}_hero_image",
			'label'         => 'Hero image',
			'name'          => 'hero_image',
			'type'          => 'image',
			'return_format' => 'array',
			'preview_size'  => 'medium',
			'instructions'  => 'Full-width photograph behind the title. Set the image\'s alt text in the media library.',
		),
	);
}

/* Brand identity on sofa models and mattress pages: name feeds the "At a
 * glance" panel and index cards; the logo sits above the page title. */
function mcd_brand_fields( $prefix ) {
	return array(
		array(
			'key'          => "field_mcd_{$prefix}_brand_name",
			'label'        => 'Brand name',
			'name'         => 'brand_name',
			'type'         => 'text',
			'instructions' => 'e.g. "King Koil". Leave blank for own-label ranges.',
		),
		array(
			'key'           => "field_mcd_{$prefix}_brand_logo",
			'label'         => 'Brand logo',
			'name'          => 'brand_logo',
			'type'          => 'image',
			'return_format' => 'array',
			'preview_size'  => 'thumbnail',
			'instructions'  => 'Optional — shown above the page title. Transparent PNG/SVG works best.',
		),
	);
}

/* The shared block library — one flexible content field attached to every
 * type. Layout names mirror the storefront's LandingBlock union
 * (storefront lib/landing-data.ts); change them in both places or not at all. */
function mcd_blocks_field( $prefix ) {
	$k = function ( $name ) use ( $prefix ) {
		return "field_mcd_{$prefix}_{$name}";
	};

	return array(
		'key'          => $k( 'blocks' ),
		'label'        => 'Page blocks',
		'name'         => 'blocks',
		'type'         => 'flexible_content',
		'button_label' => 'Add block',
		'layouts'      => array(
			array(
				'key'        => $k( 'blk_editorial' ),
				'name'       => 'editorial',
				'label'      => 'Editorial',
				'sub_fields' => array(
					array(
						'key'   => $k( 'blk_editorial_title' ),
						'label' => 'Title (optional)',
						'name'  => 'title',
						'type'  => 'text',
					),
					array(
						'key'          => $k( 'blk_editorial_body' ),
						'label'        => 'Body',
						'name'         => 'body',
						'type'         => 'textarea',
						'rows'         => 6,
						'instructions' => 'Separate paragraphs with a blank line.',
					),
				),
			),
			array(
				'key'        => $k( 'blk_features' ),
				'name'       => 'features',
				'label'      => 'Feature grid',
				'sub_fields' => array(
					array(
						'key'           => $k( 'blk_features_title' ),
						'label'         => 'Title',
						'name'          => 'title',
						'type'          => 'text',
						'default_value' => 'Key features',
					),
					array(
						'key'          => $k( 'blk_features_items' ),
						'label'        => 'Features',
						'name'         => 'items',
						'type'         => 'repeater',
						'button_label' => 'Add feature',
						'sub_fields'   => array(
							array(
								'key'   => $k( 'blk_features_items_title' ),
								'label' => 'Title',
								'name'  => 'title',
								'type'  => 'text',
							),
							array(
								'key'   => $k( 'blk_features_items_body' ),
								'label' => 'Body',
								'name'  => 'body',
								'type'  => 'textarea',
								'rows'  => 3,
							),
						),
					),
				),
			),
			array(
				'key'        => $k( 'blk_specs' ),
				'name'       => 'specs',
				'label'      => 'Specification list',
				'sub_fields' => array(
					array(
						'key'           => $k( 'blk_specs_title' ),
						'label'         => 'Title',
						'name'          => 'title',
						'type'          => 'text',
						'default_value' => 'Detail',
					),
					array(
						'key'          => $k( 'blk_specs_items' ),
						'label'        => 'Rows',
						'name'         => 'items',
						'type'         => 'repeater',
						'button_label' => 'Add row',
						'sub_fields'   => array(
							array(
								'key'   => $k( 'blk_specs_items_label' ),
								'label' => 'Label',
								'name'  => 'label',
								'type'  => 'text',
							),
							array(
								'key'   => $k( 'blk_specs_items_value' ),
								'label' => 'Value',
								'name'  => 'value',
								'type'  => 'textarea',
								'rows'  => 2,
							),
						),
					),
				),
			),
			array(
				'key'        => $k( 'blk_products' ),
				'name'       => 'products',
				'label'      => 'Product grid (live prices)',
				'sub_fields' => array(
					array(
						'key'   => $k( 'blk_products_title' ),
						'label' => 'Title',
						'name'  => 'title',
						'type'  => 'text',
					),
					array(
						'key'   => $k( 'blk_products_standfirst' ),
						'label' => 'Standfirst (optional)',
						'name'  => 'standfirst',
						'type'  => 'text',
					),
					array(
						'key'           => $k( 'blk_products_products' ),
						'label'         => 'Products',
						'name'          => 'products',
						'type'          => 'relationship',
						'post_type'     => array( 'product' ),
						'return_format' => 'id',
						'filters'       => array( 'search' ),
						'instructions'  => 'Pick the products to show. Prices and stock always come live from the shop.',
					),
					array(
						'key'          => $k( 'blk_products_search' ),
						'label'        => 'Or: catalogue search',
						'name'         => 'search',
						'type'         => 'text',
						'instructions' => 'Used only when no products are picked above — shows whatever a shop search for this text finds.',
					),
				),
			),
			array(
				'key'        => $k( 'blk_showroom' ),
				'name'       => 'showroom',
				'label'      => 'Showroom CTA (not sold online)',
				'sub_fields' => array(
					array(
						'key'           => $k( 'blk_showroom_title' ),
						'label'         => 'Title',
						'name'          => 'title',
						'type'          => 'text',
						'default_value' => 'See it in the showroom',
					),
					array(
						'key'   => $k( 'blk_showroom_body' ),
						'label' => 'Body',
						'name'  => 'body',
						'type'  => 'textarea',
						'rows'  => 3,
					),
				),
			),
			array(
				'key'        => $k( 'blk_call_cta' ),
				'name'       => 'call_cta',
				'label'      => 'Call CTA (dark band)',
				'sub_fields' => array(
					array(
						'key'           => $k( 'blk_call_cta_title' ),
						'label'         => 'Title',
						'name'          => 'title',
						'type'          => 'text',
						'default_value' => 'Talk to the team',
					),
					array(
						'key'   => $k( 'blk_call_cta_body' ),
						'label' => 'Body (optional)',
						'name'  => 'body',
						'type'  => 'textarea',
						'rows'  => 2,
					),
				),
			),
		),
	);
}
