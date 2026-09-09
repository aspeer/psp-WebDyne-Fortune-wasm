#  Pragma
#
use strict;
use vars qw($VERSION);


#  External modules
#
use Fortune;
use HTML::Entities;
use File::Basename qw(dirname);
use File::Spec;


#  Version info
#
$VERSION='1.005';


#  Initialise fortune object
#
my $fn=File::Spec->rel2abs(File::Spec->catfile(dirname(__FILE__), 'perl'));
my $fortune_or=Fortune->new($fn);
$fortune_or->read_header();


#  Routine to be called by app.psp handler
#
sub fortune {


    #  Return one fortune, encoding HTML entities so displayed correctly
    #
    return encode_entities($fortune_or->get_random_fortune());


}
